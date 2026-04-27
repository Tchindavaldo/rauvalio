import * as path from 'path'
import { scanDirectory, ScanResult, FileAST } from './ASTReaderAgent'

const screensDir = path.resolve(__dirname, '../../../src/renderer/src/screens')

function printFile(file: FileAST) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`FILE: ${file.filePath}`)
  console.log(`─`.repeat(60))

  console.log('\nIMPORTS:')
  for (const imp of file.imports) {
    const named = imp.named.length ? `{ ${imp.named.join(', ')} }` : ''
    const def = imp.default ?? ''
    console.log(`  ${[def, named].filter(Boolean).join(', ')} from '${imp.module}'`)
  }

  console.log('\nEXPORTS:')
  for (const exp of file.exports) {
    console.log(`  ${exp.isDefault ? 'default' : ''} ${exp.name}`.trim())
  }

  if (file.props.length) {
    console.log('\nPROPS:')
    for (const p of file.props) {
      console.log(`  ${p.name}: ${p.type}`)
    }
  }

  console.log('\nJSX TREE (depth ≤ 6, first 5 roots):')
  function printTree(els: typeof file.jsxTree, indent = '  ') {
    for (const el of els.slice(0, 5)) {
      const propsStr = Object.entries(el.props)
        .slice(0, 3)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ')
      console.log(`${indent}<${el.tag}${propsStr ? ' ' + propsStr : ''}>`)
      if (el.children.length) printTree(el.children, indent + '  ')
    }
  }
  printTree(file.jsxTree)

  if (file.navigationCalls.length) {
    console.log('\nNAVIGATION CALLS:')
    for (const nav of file.navigationCalls) {
      console.log(`  [line ${nav.line}] ${nav.type} → "${nav.target}"`)
    }
  } else {
    console.log('\nNAVIGATION CALLS: none detected')
  }
}

async function main() {
  console.log(`Scanning: ${screensDir}\n`)
  const result: ScanResult = await scanDirectory(screensDir)

  console.log(`Scanned at : ${result.scannedAt}`)
  console.log(`Root dir   : ${result.rootDir}`)
  console.log(`Files found: ${result.files.length}`)

  for (const file of result.files) {
    printFile(file)
  }

  // Basic assertions
  const errors: string[] = []

  if (result.files.length === 0) {
    errors.push('FAIL: no files scanned')
  }

  for (const file of result.files) {
    if (!file.filePath.endsWith('.tsx') && !file.filePath.endsWith('.ts')) {
      errors.push(`FAIL: unexpected file type: ${file.filePath}`)
    }
    if (file.jsxTree.length === 0) {
      errors.push(`WARN: no JSX found in ${file.filePath}`)
    }
    if (file.exports.length === 0) {
      errors.push(`WARN: no exports found in ${file.filePath}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  if (errors.length === 0) {
    console.log('ALL CHECKS PASSED')
  } else {
    for (const e of errors) console.log(e)
  }
}

main()
