import { scanDirectory } from './ASTReaderAgent'
import { classifyFiles } from './PageIdentifierAgent'
import { detectNavigation } from './NavigationAgent'

async function main() {
  const scan = await scanDirectory('./src/renderer/src/screens')
  const cls = await classifyFiles(scan)
  const nav = await detectNavigation(scan, cls)

  console.log('\nCLASSIFICATIONS:')
  for (const c of cls.classifications) {
    console.log(`  [${c.role.padEnd(9)} ${(c.confidence * 100).toFixed(0).padStart(3)}%] ${c.filePath} — ${c.reason}`)
  }

  console.log('\nEDGES:')
  if (nav.edges.length === 0) {
    console.log('  (none detected)')
  } else {
    for (const e of nav.edges) {
      console.log(`  [${e.type.padEnd(11)}] ${e.from} → ${e.to}`)
      console.log(`               label: "${e.label}"  anchor: "${e.anchor}"`)
    }
  }
}

main()
