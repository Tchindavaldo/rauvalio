import { chat } from '../llm'
import type { ScanResult, FileAST } from './ASTReaderAgent'

export type FileRole = 'page' | 'layout' | 'component' | 'shared' | 'unknown'

export interface FileClassification {
  filePath: string
  role: FileRole
  confidence: number // 0–1
  reason: string
}

export interface ClassificationResult {
  classifications: FileClassification[]
}

// Groq free tier: 12k TPM. Each file summary ≈ 60-80 tokens → safe batch = 30 files.
const BATCH_SIZE = 30

const SYSTEM_PROMPT = `You are a React/TypeScript file classifier. Your ONLY task is to classify each file in a list.

For each file, output exactly one of these roles:
- "page"      — a top-level screen rendered as a full view (has its own layout, typically returned by a route)
- "layout"    — a wrapper that provides shared chrome (nav bar, tab bar, shell) around pages
- "component" — a reusable UI piece used inside pages or layouts
- "shared"    — utility, hook, context, type, or non-visual module

Rules:
- A file is a "page" if its JSX root fills the entire screen (position relative/absolute, width/height 100%)
- A file is a "component" if it is imported and composed inside pages
- Short files with no JSX are "shared"
- Do NOT infer from file names alone — use the JSX tree and import patterns

Respond ONLY with a JSON array, no markdown, no explanation:
[
  { "filePath": "...", "role": "page"|"layout"|"component"|"shared"|"unknown", "confidence": 0.0-1.0, "reason": "one sentence" },
  ...
]`

function buildUserMessage(files: FileAST[]): string {
  const summaries = files.map((f) => ({
    filePath: f.filePath,
    imports: f.imports.slice(0, 6).map((i) => i.module),
    exports: f.exports.map((e) => e.name),
    jsxRootTags: f.jsxTree.slice(0, 2).map((el) => ({
      tag: el.tag,
      props: Object.keys(el.props).slice(0, 4),
      childCount: el.children.length,
    })),
    propNames: f.props.slice(0, 3).map((p) => p.name),
  }))
  return JSON.stringify(summaries)  // compact JSON — no pretty-print → fewer tokens
}

function fallback(files: FileAST[]): FileClassification[] {
  return files.map((f) => ({
    filePath: f.filePath,
    role: 'unknown' as FileRole,
    confidence: 0,
    reason: 'batch error',
  }))
}

function parseClassifications(raw: string, files: FileAST[]): FileClassification[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as FileClassification[]
  } catch { /* fall through */ }
  return fallback(files)
}

// Chunk array into sub-arrays of size n
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

export async function classifyFiles(scanResult: ScanResult): Promise<ClassificationResult> {
  const batches = chunk(scanResult.files, BATCH_SIZE)
  const allClassifications: FileClassification[] = []

  for (const batch of batches) {
    try {
      const raw = await chat(SYSTEM_PROMPT, buildUserMessage(batch))
      allClassifications.push(...parseClassifications(raw, batch))
    } catch (err) {
      console.error('[PageIdentifierAgent] batch failed:', (err as Error)?.message ?? err)
      allClassifications.push(...fallback(batch))
    }
  }

  return { classifications: allClassifications }
}
