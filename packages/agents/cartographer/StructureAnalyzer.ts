import { Project, SyntaxKind, SourceFile, Node } from 'ts-morph'

// Framework-agnostic structural signals extracted via static analysis.
// We deliberately avoid framework-specific naming (e.g. "isLocationPopupVisible")
// and instead surface generic patterns that work on any React/RN/Next/Vite project.

export interface StructuralSignals {
  filePath: string
  // Imports that suggest the file renders a modal/sheet/overlay surface
  modalImports: string[]
  // Booleans of the form isXxxVisible / xxxOpen / showXxx that gate a render branch
  visibilityFlags: string[]
  // Discriminating states like activeTab/step/mode with their possible string values
  discriminantStates: Array<{ name: string; values: string[] }>
  // Top-level JSX tag(s) the component renders
  rootJsxTags: string[]
  // Components imported from sibling files that are rendered conditionally
  conditionallyRenderedComponents: string[]
  // Default export name (component) if any
  defaultExportName: string | null
  // First 800 chars of the file for last-resort LLM context
  excerpt: string
}

const MODAL_LIB_NAMES = [
  'Modal', 'BottomSheet', 'BottomSheetModal', 'Dialog', 'Drawer',
  'Popover', 'Sheet', 'Overlay', 'Popup', 'AlertDialog', 'ActionSheet',
]

const VISIBILITY_FLAG_RE = /^(is[A-Z]\w*(?:Visible|Open|Shown|Active))$|^(show[A-Z]\w*)$|^(\w+(?:Visible|Open|Shown))$/

const DISCRIMINANT_NAMES = new Set([
  'activeTab', 'currentTab', 'selectedTab', 'tab',
  'step', 'currentStep', 'activeStep', 'stage',
  'mode', 'view', 'currentView', 'screen', 'currentScreen',
  'panel', 'activePanel', 'section', 'currentSection',
  'page', 'activePage', 'route',
])

function getDefaultExportName(sf: SourceFile): string | null {
  for (const decl of sf.getFunctions()) {
    if (decl.isDefaultExport() || decl.isExported()) {
      const name = decl.getName()
      if (name) return name
    }
  }
  for (const v of sf.getVariableDeclarations()) {
    const name = v.getName()
    const stmt = v.getVariableStatement()
    if (stmt?.isExported()) return name
  }
  return null
}

function getRootJsxTags(sf: SourceFile): string[] {
  const tags = new Set<string>()
  // Find return statements at function bodies and collect their direct JSX root.
  sf.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.ReturnStatement) return
    const expr = node.asKindOrThrow(SyntaxKind.ReturnStatement).getExpression()
    if (!expr) return
    const k = expr.getKind()
    if (k === SyntaxKind.JsxElement) {
      tags.add(expr.asKindOrThrow(SyntaxKind.JsxElement).getOpeningElement().getTagNameNode().getText())
    } else if (k === SyntaxKind.JsxSelfClosingElement) {
      tags.add(expr.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText())
    } else if (k === SyntaxKind.JsxFragment) {
      // Fragment — peek at first JSX child
      const first = expr.getFirstDescendantByKind(SyntaxKind.JsxElement)
        ?? expr.getFirstDescendantByKind(SyntaxKind.JsxSelfClosingElement)
      if (first) {
        const fk = first.getKind()
        if (fk === SyntaxKind.JsxElement) {
          tags.add(first.asKindOrThrow(SyntaxKind.JsxElement).getOpeningElement().getTagNameNode().getText())
        } else {
          tags.add(first.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText())
        }
      }
    } else if (k === SyntaxKind.ParenthesizedExpression) {
      const inner = expr.asKindOrThrow(SyntaxKind.ParenthesizedExpression).getExpression()
      if (inner.getKind() === SyntaxKind.JsxElement) {
        tags.add(inner.asKindOrThrow(SyntaxKind.JsxElement).getOpeningElement().getTagNameNode().getText())
      } else if (inner.getKind() === SyntaxKind.JsxSelfClosingElement) {
        tags.add(inner.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText())
      }
    }
  })
  return Array.from(tags)
}

function getVisibilityFlagsAndDiscriminants(sf: SourceFile): {
  flags: string[]
  discriminants: Array<{ name: string; values: string[] }>
} {
  const flags = new Set<string>()
  const discriminants = new Map<string, Set<string>>()

  // useState hook calls
  sf.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.CallExpression) return
    const call = node.asKindOrThrow(SyntaxKind.CallExpression)
    const exprText = call.getExpression().getText()
    if (exprText !== 'useState' && exprText !== 'React.useState') return

    // Look at the parent VariableDeclaration to find the destructured state name
    const parent = call.getParent()?.getParent()
    if (!parent || parent.getKind() !== SyntaxKind.VariableDeclaration) return
    const vd = parent.asKindOrThrow(SyntaxKind.VariableDeclaration)
    const nameNode = vd.getNameNode()
    if (nameNode.getKind() !== SyntaxKind.ArrayBindingPattern) return
    const elements = nameNode.asKindOrThrow(SyntaxKind.ArrayBindingPattern).getElements()
    const first = elements[0]
    if (!first || first.getKind() !== SyntaxKind.BindingElement) return
    const stateName = first.getText()

    if (VISIBILITY_FLAG_RE.test(stateName)) {
      flags.add(stateName)
    }
    if (DISCRIMINANT_NAMES.has(stateName)) {
      discriminants.set(stateName, new Set())
    }
  })

  // Now scan for `stateName === 'value'` to harvest possible values for discriminants
  if (discriminants.size > 0) {
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.BinaryExpression) return
      const be = node.asKindOrThrow(SyntaxKind.BinaryExpression)
      const op = be.getOperatorToken().getText()
      if (op !== '===' && op !== '==') return
      const left = be.getLeft().getText()
      const right = be.getRight()
      if (!discriminants.has(left)) return
      if (right.getKind() === SyntaxKind.StringLiteral) {
        const val = right.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
        discriminants.get(left)!.add(val)
      }
    })
  }

  return {
    flags: Array.from(flags),
    discriminants: Array.from(discriminants.entries())
      .map(([name, values]) => ({ name, values: Array.from(values) }))
      .filter((d) => d.values.length > 0),
  }
}

function getModalImports(sf: SourceFile): string[] {
  const found = new Set<string>()
  for (const imp of sf.getImportDeclarations()) {
    for (const named of imp.getNamedImports()) {
      const name = named.getName()
      if (MODAL_LIB_NAMES.some((m) => name === m || name.endsWith(m))) {
        found.add(name)
      }
    }
    const def = imp.getDefaultImport()?.getText()
    if (def && MODAL_LIB_NAMES.some((m) => def === m || def.endsWith(m))) {
      found.add(def)
    }
  }
  return Array.from(found)
}

function getConditionallyRenderedComponents(sf: SourceFile): string[] {
  const localImports = new Set<string>()
  for (const imp of sf.getImportDeclarations()) {
    const spec = imp.getModuleSpecifierValue()
    if (!spec.startsWith('.') && !spec.startsWith('@/')) continue
    for (const named of imp.getNamedImports()) localImports.add(named.getName())
    const def = imp.getDefaultImport()?.getText()
    if (def) localImports.add(def)
  }

  const renderedConditionally = new Set<string>()
  // Look for JSX tags that appear inside a ConditionalExpression or LogicalExpression branch
  sf.forEachDescendant((node) => {
    const k = node.getKind()
    if (k !== SyntaxKind.JsxElement && k !== SyntaxKind.JsxSelfClosingElement) return
    const tagName = k === SyntaxKind.JsxElement
      ? node.asKindOrThrow(SyntaxKind.JsxElement).getOpeningElement().getTagNameNode().getText()
      : node.asKindOrThrow(SyntaxKind.JsxSelfClosingElement).getTagNameNode().getText()
    if (!localImports.has(tagName)) return
    // Walk up: is any ancestor a conditional?
    let parent: Node | undefined = node.getParent()
    while (parent) {
      const pk = parent.getKind()
      if (pk === SyntaxKind.ConditionalExpression || pk === SyntaxKind.BinaryExpression) {
        renderedConditionally.add(tagName)
        break
      }
      if (pk === SyntaxKind.JsxExpression) {
        // continue up — JSX expression containers can wrap conditionals
        parent = parent.getParent()
        continue
      }
      // Stop at function/return — going further up isn't meaningful for conditional rendering
      if (pk === SyntaxKind.FunctionDeclaration || pk === SyntaxKind.ArrowFunction) break
      parent = parent.getParent()
    }
  })
  return Array.from(renderedConditionally)
}

export function analyzeFiles(rootDir: string, relativePaths: string[]): StructuralSignals[] {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { jsx: 4, allowJs: true },
  })
  project.addSourceFilesAtPaths(relativePaths.map((p) => `${rootDir}/${p}`))

  const out: StructuralSignals[] = []
  for (const sf of project.getSourceFiles()) {
    if (sf.getFilePath().endsWith('.d.ts')) continue
    try {
      const filePath = sf.getFilePath().replace(/\\/g, '/').replace(rootDir.replace(/\\/g, '/') + '/', '')
      const { flags, discriminants } = getVisibilityFlagsAndDiscriminants(sf)
      out.push({
        filePath,
        modalImports: getModalImports(sf),
        visibilityFlags: flags,
        discriminantStates: discriminants,
        rootJsxTags: getRootJsxTags(sf),
        conditionallyRenderedComponents: getConditionallyRenderedComponents(sf),
        defaultExportName: getDefaultExportName(sf),
        excerpt: sf.getFullText().slice(0, 800),
      })
    } catch { /* skip malformed file */ }
  }
  return out
}
