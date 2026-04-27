import { chat } from '../llm'
import type { FileAST } from './ASTReaderAgent'
import type { FileClassification } from './PageIdentifierAgent'
import type { NavigationEdge } from './NavigationAgent'

export interface PageLabel {
  filePath: string
  label: string
  confidence: number
  detectedLanguage: 'fr' | 'en' | 'mixed'
  reason: string
}

export interface SemanticResult {
  labels: PageLabel[]
}

const SYSTEM_PROMPT = `You are a semantic page namer for React/TypeScript apps. Your ONLY task is to assign a short, human-readable business label to each page based on its UI text content and role.

For each page, extract:
1. All visible text from JSX (h1, h2, button text, labels, placeholders)
2. Page role (page/layout/component/shared)
3. Navigation edges (what pages link TO this page)
4. Based on these signals, invent a SHORT (1-2 words) business label in the DETECTED LANGUAGE

Rules:
- Detect language from UI text (French: "Connexion", English: "Login")
- Label should be a screen or feature name, not a file name
- Examples:
  * "HomeScreen.tsx" with "Accueil", "Shop", "Products" → "Accueil" or "Boutique"
  * "AuthScreen.tsx" with "Sign in", "Email", "Password" → "Connexion" or "Login"
  * "CartScreen.tsx" with "Panier", "Total", "Checkout" → "Panier" or "Cart"
- Confidence: 0.5-1.0 (higher if many matching keywords, lower if ambiguous)
- Do NOT invent labels from file names alone — use VISIBLE TEXT

Respond ONLY with a JSON array, no markdown, no explanation:
[
  { "filePath": "...", "label": "...", "confidence": 0.0-1.0, "detectedLanguage": "fr"|"en"|"mixed", "reason": "..." },
  ...
]`

function extractVisibleText(jsxTree: JSXElement[]): string[] {
  const texts: string[] = []

  function walk(els: JSXElement[]) {
    for (const el of els) {
      // Collect text content from tags that typically hold UI labels
      if (['h1', 'h2', 'h3', 'label', 'button', 'span', 'div', 'p'].includes(el.tag)) {
        const text = el.props['children']
        if (text && typeof text === 'string' && text.trim()) {
          texts.push(text.trim())
        }
      }
      // Check for common semantic attributes
      if (el.props['placeholder']) texts.push(el.props['placeholder'])
      if (el.props['aria-label']) texts.push(el.props['aria-label'])
      if (el.props['title']) texts.push(el.props['title'])
      if (el.children.length) walk(el.children)
    }
  }

  walk(jsxTree)
  return texts
}

interface JSXElement {
  tag: string
  props: Record<string, string>
  children: JSXElement[]
}

function buildUserMessage(
  pageFiles: FileAST[],
  classifications: Map<string, FileClassification>,
  edges: NavigationEdge[]
): string {
  const summaries = pageFiles.map((f) => {
    const classification = classifications.get(f.filePath)
    const visibleTexts = extractVisibleText(f.jsxTree)
    const incomingEdges = edges.filter((e) => e.to === f.filePath)

    return {
      filePath: f.filePath,
      role: classification?.role ?? 'unknown',
      visibleTexts: visibleTexts.slice(0, 15), // First 15 text snippets
      incomingEdges: incomingEdges.map((e) => ({
        from: e.from.split('/').pop(),
        label: e.label,
      })),
      exports: f.exports.map((e) => e.name).slice(0, 3),
    }
  })
  return JSON.stringify(summaries)
}

function fallback(pageFiles: FileAST[]): PageLabel[] {
  return pageFiles.map((f) => ({
    filePath: f.filePath,
    label: f.filePath.split('/').pop()?.replace('.tsx', '').replace('Screen', '') ?? 'Page',
    confidence: 0,
    detectedLanguage: 'mixed',
    reason: 'batch error — fallback to filename',
  }))
}

function parseLabels(raw: string, pageFiles: FileAST[]): PageLabel[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as PageLabel[]
  } catch { /* fall through */ }
  return fallback(pageFiles)
}

export async function labelPages(
  fileAsts: FileAST[],
  classifications: FileClassification[],
  edges: NavigationEdge[]
): Promise<SemanticResult> {
  // Only label pages
  const pageClassifications = classifications.filter((c) => c.role === 'page')
  const classificationMap = new Map(pageClassifications.map((c) => [c.filePath, c]))
  const pageFiles = fileAsts.filter((f) => classificationMap.has(f.filePath))

  if (pageFiles.length === 0) {
    return { labels: [] }
  }

  try {
    const raw = await chat(SYSTEM_PROMPT, buildUserMessage(pageFiles, classificationMap, edges))
    const labels = parseLabels(raw, pageFiles)
    return { labels }
  } catch {
    return { labels: fallback(pageFiles) }
  }
}
