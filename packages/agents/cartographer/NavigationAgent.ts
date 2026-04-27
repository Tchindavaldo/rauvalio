import { chat } from '../llm'
import type { ScanResult, FileAST } from './ASTReaderAgent'
import type { ClassificationResult } from './PageIdentifierAgent'

export type EdgeType = 'explicit' | 'implicit' | 'conditional'

export interface NavigationEdge {
  from: string       // filePath of source page
  to: string         // filePath of target page
  label: string      // human-readable action label
  anchor: string     // data-anchor or button id that triggers it
  type: EdgeType
}

export interface NavigationResult {
  edges: NavigationEdge[]
}

const SYSTEM_PROMPT = `You are a navigation graph extractor for React/TypeScript apps. Your ONLY task is to find all navigation links between pages.

Detect navigation from:
1. router.push('/route'), navigate('Screen'), Link href="/route" — type "explicit"
2. data-anchor attributes on buttons/elements that semantically link to another screen — type "implicit"
3. Conditional flows inferred from props, auth checks, or button semantics — type "conditional"

Rules:
- Only emit edges where BOTH from and to are classified as "page"
- Use the file's filePath as the from/to identifiers
- label = short human-readable action (e.g. "tap product", "order now", "if !auth")
- anchor = the data-anchor value, button text, or triggering element id (lowercase-kebab)
- If no navigation exists between two pages, do NOT invent edges

Respond ONLY with a JSON array, no markdown, no explanation:
[
  { "from": "filePath", "to": "filePath", "label": "...", "anchor": "...", "type": "explicit"|"implicit"|"conditional" },
  ...
]`

// Groq free tier: 12k TPM. Pages summary ≈ 150 tokens each → safe batch = 20 pages.
const PAGE_BATCH_SIZE = 20

function buildUserMessage(pages: FileAST[]): string {
  const summaries = pages.map((f: FileAST) => ({
    filePath: f.filePath,
    navigationCalls: f.navigationCalls.slice(0, 10),
    interactiveElements: collectInteractiveElements(f).slice(0, 10),
  }))
  return JSON.stringify(summaries)  // compact — fewer tokens
}

function collectInteractiveElements(file: FileAST): Array<{ tag: string; anchor?: string; text?: string }> {
  const result: Array<{ tag: string; anchor?: string; text?: string }> = []

  function walk(els: typeof file.jsxTree) {
    for (const el of els) {
      if (['button', 'a', 'Link', 'Pressable', 'TouchableOpacity'].includes(el.tag)) {
        result.push({
          tag: el.tag,
          anchor: el.props['data-anchor'],
          text: el.props['children'],
        })
      }
      if (el.props['data-anchor']) {
        result.push({ tag: el.tag, anchor: el.props['data-anchor'] })
      }
      if (el.children.length) walk(el.children)
    }
  }

  walk(file.jsxTree)
  return result
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

export async function detectNavigation(
  scanResult: ScanResult,
  classificationResult: ClassificationResult
): Promise<NavigationResult> {
  const pageFiles = new Set(
    classificationResult.classifications
      .filter((c) => c.role === 'page')
      .map((c) => c.filePath)
  )

  const pages = scanResult.files.filter((f) => pageFiles.has(f.filePath))
  const batches = chunk(pages, PAGE_BATCH_SIZE)
  const allEdges: NavigationEdge[] = []

  for (const batch of batches) {
    try {
      const raw = await chat(SYSTEM_PROMPT, buildUserMessage(batch))
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) allEdges.push(...parsed as NavigationEdge[])
    } catch { /* skip batch */ }
  }

  return { edges: allEdges }
}
