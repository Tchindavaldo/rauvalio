import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph'
import * as path from 'path'

export interface JSXElement {
  tag: string
  props: Record<string, string>
  children: JSXElement[]
}

export interface NavigationCall {
  type: 'router.push' | 'navigate' | 'Link' | 'href'
  target: string
  line: number
}

export interface FileAST {
  filePath: string
  imports: Array<{ module: string; named: string[]; default: string | null }>
  exports: Array<{ name: string; isDefault: boolean }>
  jsxTree: JSXElement[]
  props: Array<{ name: string; type: string }>
  navigationCalls: NavigationCall[]
}

export interface ScanResult {
  scannedAt: string
  rootDir: string
  files: FileAST[]
}

// Dossiers à ignorer dans n'importe quel projet
const EXCLUDED_DIRS = [
  'node_modules', '.expo', '.git', 'dist', 'build', 'out',
  '.next', '.turbo', 'coverage', '__tests__', '__mocks__',
  'android', 'ios', '.cache', 'public',
]

const MAX_FILES = 300

function shouldExclude(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/')
  return EXCLUDED_DIRS.some((dir) => normalized.includes(`/${dir}/`) || normalized.includes(`/${dir}`))
}

function tick(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve))
}

function extractJSXTree(node: Node, depth = 0): JSXElement[] {
  if (depth > 5) return []
  const elements: JSXElement[] = []

  node.forEachChild((child) => {
    if (
      child.getKind() === SyntaxKind.JsxElement ||
      child.getKind() === SyntaxKind.JsxSelfClosingElement
    ) {
      const el = parseJSXElement(child, depth)
      if (el) elements.push(el)
    } else {
      elements.push(...extractJSXTree(child, depth))
    }
  })

  return elements
}

function parseJSXElement(node: Node, depth: number): JSXElement | null {
  const props: Record<string, string> = {}
  let tag = 'Unknown'
  let children: JSXElement[] = []

  try {
    if (node.getKind() === SyntaxKind.JsxSelfClosingElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxSelfClosingElement)
      tag = el.getTagNameNode().getText()
      for (const attr of el.getAttributes()) {
        if (attr.getKind() === SyntaxKind.JsxAttribute) {
          const a = attr.asKindOrThrow(SyntaxKind.JsxAttribute)
          const init = a.getInitializer()
          props[a.getNameNode().getText()] = init ? init.getText().replace(/^["']|["']$/g, '') : 'true'
        }
      }
    } else if (node.getKind() === SyntaxKind.JsxElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxElement)
      tag = el.getOpeningElement().getTagNameNode().getText()
      for (const attr of el.getOpeningElement().getAttributes()) {
        if (attr.getKind() === SyntaxKind.JsxAttribute) {
          const a = attr.asKindOrThrow(SyntaxKind.JsxAttribute)
          const init = a.getInitializer()
          props[a.getNameNode().getText()] = init ? init.getText().replace(/^["']|["']$/g, '') : 'true'
        }
      }
      children = extractJSXTree(el, depth + 1)
    }
  } catch {
    // Malformed JSX node — skip silently
  }

  return { tag, props, children }
}

function extractNavigationCalls(sourceFile: SourceFile): NavigationCall[] {
  const calls: NavigationCall[] = []

  try {
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
      try {
        const expr = call.getExpression().getText()
        const args = call.getArguments()
        const target = args[0]?.getText().replace(/^["'`]|["'`]$/g, '') ?? ''

        if (expr === 'router.push' || expr === 'router.replace') {
          calls.push({ type: 'router.push', target, line: call.getStartLineNumber() })
        } else if (expr === 'navigate' || expr === 'navigation.navigate') {
          calls.push({ type: 'navigate', target, line: call.getStartLineNumber() })
        }
      } catch { /* skip */ }
    })

    // <Link href/to>
    const linkElements = [
      ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement),
      ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ]
    for (const el of linkElements) {
      try {
        const isJsxEl = el.getKind() === SyntaxKind.JsxElement
        const tagName = isJsxEl
          ? el.asKindOrThrow(SyntaxKind.JsxElement).getOpeningElement().getTagNameNode().getText()
          : el.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText()

        if (tagName !== 'Link') continue

        const attrs = isJsxEl
          ? el.asKindOrThrow(SyntaxKind.JsxElement).getOpeningElement().getAttributes()
          : el.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getAttributes()

        for (const attr of attrs) {
          if (attr.getKind() !== SyntaxKind.JsxAttribute) continue
          const a = attr.asKindOrThrow(SyntaxKind.JsxAttribute)
          const attrName = a.getNameNode().getText()
          if (attrName !== 'href' && attrName !== 'to') continue
          const init = a.getInitializer()
          const target = init ? init.getText().replace(/^["'`{]|["'`}]$/g, '') : ''
          calls.push({ type: attrName === 'href' ? 'href' : 'Link', target, line: a.getStartLineNumber() })
        }
      } catch { /* skip */ }
    }
  } catch { /* skip entire file */ }

  return calls
}

function parseFile(sourceFile: SourceFile, rootDir: string): FileAST {
  const filePath = path.relative(rootDir, sourceFile.getFilePath()).replace(/\\/g, '/')

  // Safe import extraction — skip non-string-literal module specifiers (dynamic imports, template literals)
  const imports: FileAST['imports'] = []
  for (const imp of sourceFile.getImportDeclarations()) {
    try {
      const specifier = imp.getModuleSpecifier()
      if (specifier.getKind() !== SyntaxKind.StringLiteral) continue
      imports.push({
        module: imp.getModuleSpecifierValue(),
        named: imp.getNamedImports().map((n) => n.getName()),
        default: imp.getDefaultImport()?.getText() ?? null,
      })
    } catch { /* skip malformed import */ }
  }

  const exports: FileAST['exports'] = []
  try {
    sourceFile.getExportedDeclarations().forEach((decls, name) => {
      decls.forEach(() => {
        exports.push({ name, isDefault: name === 'default' })
      })
    })
  } catch { /* skip */ }

  const props: FileAST['props'] = []
  try {
    const funcs = [
      ...sourceFile.getFunctions(),
      ...sourceFile.getVariableDeclarations().flatMap((v) => {
        const init = v.getInitializer()
        return init && (
          init.getKind() === SyntaxKind.ArrowFunction ||
          init.getKind() === SyntaxKind.FunctionExpression
        ) ? [init] : []
      }),
    ]

    for (const fn of funcs) {
      const params = (fn as { getParameters?: () => unknown[] }).getParameters?.() ?? []
      for (const param of params as Array<{ getTypeNode: () => Node | undefined; getName: () => string }>) {
        const typeNode = param.getTypeNode()
        if (!typeNode) continue
        if (typeNode.getKind() === SyntaxKind.TypeLiteral) {
          typeNode.asKindOrThrow(SyntaxKind.TypeLiteral).getMembers().forEach((m: Node) => {
            try { props.push({ name: m.getSymbol()?.getName() ?? '?', type: m.getType().getText() }) } catch { /* skip */ }
          })
        } else {
          props.push({ name: param.getName(), type: typeNode.getText() })
        }
      }
      break
    }
  } catch { /* skip */ }

  const jsxTree = extractJSXTree(sourceFile)
  const navigationCalls = extractNavigationCalls(sourceFile)

  return { filePath, imports, exports, jsxTree, props, navigationCalls }
}

export async function scanDirectory(rootDir: string): Promise<ScanResult> {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { jsx: 4 /* JsxEmit.ReactJSX */, allowJs: true },
  })

  project.addSourceFilesAtPaths([
    `${rootDir}/**/*.ts`,
    `${rootDir}/**/*.tsx`,
    `${rootDir}/**/*.js`,
    `${rootDir}/**/*.jsx`,
  ])

  // Filter out excluded dirs and cap at MAX_FILES
  const allFiles = project.getSourceFiles().filter((sf) => !shouldExclude(sf.getFilePath()))
  const filesToParse = allFiles.slice(0, MAX_FILES)

  const files: FileAST[] = []
  const BATCH = 20

  for (let i = 0; i < filesToParse.length; i += BATCH) {
    const batch = filesToParse.slice(i, i + BATCH)
    for (const sf of batch) {
      try {
        files.push(parseFile(sf, rootDir))
      } catch { /* skip unreadable file */ }
    }
    await tick() // yield to event loop between batches — évite le freeze
  }

  return {
    scannedAt: new Date().toISOString(),
    rootDir,
    files,
  }
}
