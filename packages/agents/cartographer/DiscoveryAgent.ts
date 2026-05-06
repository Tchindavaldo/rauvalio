import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { chat } from '../llm'
import { analyzeFiles, type StructuralSignals } from './StructureAnalyzer'

export type ScreenType = 'route' | 'modal' | 'sheet' | 'overlay' | 'tab' | 'panel' | 'step' | 'unknown'

export interface ScreenCandidate {
  filePath: string             // source file
  screenId: string             // unique id, e.g. "src/features/checkout/components/CheckoutSheet.tsx#detail"
  screenLabel: string          // human label, e.g. "Checkout — Détail"
  screenType: ScreenType
  parentScreenId?: string      // when the screen is a sub-view of another (e.g. tab of a sheet)
  trigger?: string             // what action reveals it, in plain language
}

export interface DiscoveryResult {
  screens: ScreenCandidate[]
  reason: string
}

const EXCLUDED_DIRS = new Set([
  'node_modules', '.expo', '.git', 'dist', 'build', 'out',
  '.next', '.turbo', 'coverage', '__tests__', '__mocks__',
  'android', 'ios', '.cache', 'public', '.vscode', '.idea',
])

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx'])

interface TreeEntry {
  path: string
  type: 'file' | 'dir'
}

function buildTree(rootDir: string, maxEntries = 1500): TreeEntry[] {
  const entries: TreeEntry[] = []
  const stack: string[] = [rootDir]
  while (stack.length && entries.length < maxEntries) {
    const dir = stack.pop()!
    let children: string[]
    try { children = readdirSync(dir) } catch { continue }
    for (const name of children) {
      if (EXCLUDED_DIRS.has(name)) continue
      const full = join(dir, name)
      let st
      try { st = statSync(full) } catch { continue }
      const rel = relative(rootDir, full).replace(/\\/g, '/')
      if (st.isDirectory()) {
        entries.push({ path: rel, type: 'dir' })
        stack.push(full)
      } else if (st.isFile()) {
        const dotIdx = name.lastIndexOf('.')
        if (dotIdx === -1) continue
        if (!CODE_EXT.has(name.slice(dotIdx))) continue
        if (name.endsWith('.d.ts')) continue
        entries.push({ path: rel, type: 'file' })
      }
      if (entries.length >= maxEntries) break
    }
  }
  return entries
}

// =============================================================================
// PHASE 1 — Broad candidate selection (file paths only)
// =============================================================================

const PHASE1_PROMPT = `You are a project navigator for any web/mobile codebase (React, React Native, Next.js, Expo, Vue, Svelte, Electron, etc.).

Your task: given a flat list of file paths, pick EVERY file that could render a USER-VISIBLE SCREEN. Be GENEROUS — include anything that might be one of:
- A route/page (in app/, pages/, screens/, views/, routes/)
- A modal, dialog, popup, drawer, popover, action sheet, bottom sheet
- An overlay or full-screen component
- A panel that swaps the main content based on app state
- A wizard/stepper/multi-step component
- Any *Sheet, *Modal, *Panel, *Overlay, *View, *Page, *Screen, *Step file
- Any component that visibly fills the screen (even if not routed)

Skip ONLY files that are clearly not visual: services, hooks, contexts, types, utils, configs, styles-only files, tests.

When unsure, INCLUDE the file. Phase 2 will refine.

Use exact paths from the input (forward slashes, relative to project root).

Respond ONLY with a JSON object, no markdown:
{
  "candidatePaths": ["...", "..."],
  "reason": "one short sentence describing the project's convention"
}`

interface Phase1Result {
  candidatePaths: string[]
  reason: string
}

function stripFences(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
}

function parseJSON<T>(raw: string): T | null {
  try { return JSON.parse(stripFences(raw)) as T } catch { return null }
}

async function phase1Discovery(tree: TreeEntry[]): Promise<Phase1Result> {
  const userMessage = JSON.stringify(tree.map((e) => (e.type === 'dir' ? `${e.path}/` : e.path)))
  try {
    const raw = await chat(PHASE1_PROMPT, userMessage)
    const parsed = parseJSON<Phase1Result>(raw)
    if (parsed && Array.isArray(parsed.candidatePaths)) {
      return {
        candidatePaths: parsed.candidatePaths.filter((p) => typeof p === 'string'),
        reason: parsed.reason ?? '',
      }
    }
  } catch (err) {
    console.error('[DiscoveryAgent.phase1] failed:', (err as Error)?.message ?? err)
  }
  return phase1Heuristic(tree)
}

function phase1Heuristic(tree: TreeEntry[]): Phase1Result {
  const files = tree.filter((e) => e.type === 'file').map((e) => e.path)
  const candidates = files.filter((p) => {
    const lower = p.toLowerCase()
    if (/\.(test|spec)\.(t|j)sx?$/.test(p)) return false
    if (/\.styles?\.(t|j)sx?$/.test(p)) return false
    if (/\/(services|utils|hooks|types|constants|api|theme|context|contexts)\//.test(p)) return false
    if (/^app\//.test(p)) return true
    if (/^pages\//.test(p)) return true
    if (/\/(screens|pages|views|routes)\//.test(p)) return true
    if (/(screen|page|sheet|modal|panel|overlay|view|step|wizard|drawer|dialog|popup)\.tsx?$/i.test(lower)) return true
    return false
  })
  return { candidatePaths: candidates, reason: 'heuristic fallback (LLM unavailable)' }
}

// =============================================================================
// PHASE 2 — Semantic decomposition (one file → N logical screens)
// =============================================================================

const PHASE2_PROMPT = `You are a UI screen decomposer. For each file you receive, decide how many DISTINCT screens (= things the user perceives as a separate view) it produces, and describe each one.

Each input file comes with structural signals:
- modalImports: imported modal/sheet/dialog primitives → file likely renders an overlay-type screen
- visibilityFlags: boolean states like isXxxVisible / xxxOpen → each one toggles a sub-screen (overlay)
- discriminantStates: string states like activeTab/step/mode + their possible values → each value is a sub-screen
- rootJsxTags: top-level JSX elements rendered
- conditionallyRenderedComponents: imported components rendered conditionally → likely sub-panels
- excerpt: first 800 chars of the file

Rules for decomposition:
- A simple route/page with no tabs/modals/overlays → 1 screen of type "route" (or "page")
- A file with a discriminantState (activeTab, step, mode) producing N values → N screens of type "tab" or "step", each parented to the main screen
- A file with visibilityFlags → 1 main screen + 1 "overlay" screen per flag
- A file with modalImports as its root → 1 screen of type "modal" or "sheet"
- A file with conditionallyRenderedComponents that look like sub-views → 1 "panel" screen per swap
- Combine: a CheckoutSheet with 4 tabs and 5 overlays → 1 sheet screen + 4 tab screens (parent=sheet) + 5 overlay screens (parent=sheet)

screenId format: "<filePath>#<slug>" — slug is "main" for the primary screen, otherwise the value name (e.g. "detail", "extras") or flag name lowercased.

screenType values: "route" | "modal" | "sheet" | "overlay" | "tab" | "panel" | "step" | "unknown"

screenLabel: short human-readable, in the language detected from the project (French/English/etc.). Infer from state names, file name, and excerpt.

trigger: short plain-language description of how the user reaches this screen ("tap on menu item", "opens after Add to Cart", etc.). Optional, omit if unsure.

Respond ONLY with a JSON object, no markdown:
{
  "screens": [
    {
      "filePath": "...",
      "screenId": "<filePath>#<slug>",
      "screenLabel": "...",
      "screenType": "...",
      "parentScreenId": "<filePath>#main",  // omit for top-level screens
      "trigger": "..."                        // optional
    }
  ]
}`

const PHASE2_BATCH_SIZE = 5

function buildPhase2UserMessage(batch: StructuralSignals[]): string {
  // Keep payload tight — structural signals carry most of the meaning, the
  // excerpt is just a tiebreaker.
  return JSON.stringify(batch.map((s) => ({
    filePath: s.filePath,
    modalImports: s.modalImports,
    visibilityFlags: s.visibilityFlags,
    discriminantStates: s.discriminantStates,
    rootJsxTags: s.rootJsxTags,
    conditionallyRenderedComponents: s.conditionallyRenderedComponents,
    defaultExportName: s.defaultExportName,
    excerpt: s.excerpt.slice(0, 200),
  })))
}

function fallbackDecompose(signals: StructuralSignals): ScreenCandidate[] {
  // Deterministic fallback when the LLM doesn't return decomposition.
  // Always emit at least one main screen for the file.
  const screens: ScreenCandidate[] = []
  const mainId = `${signals.filePath}#main`
  const isOverlayLike = signals.modalImports.length > 0
    || signals.rootJsxTags.some((t) => /Modal|Sheet|Dialog|Drawer|Overlay|Popup|Popover/.test(t))
  const screenType: ScreenType = isOverlayLike
    ? (signals.rootJsxTags.some((t) => /Sheet/.test(t)) ? 'sheet' : 'modal')
    : (/^app\/|^pages\/|\/(screens|pages|views)\//.test(signals.filePath) ? 'route' : 'unknown')

  const fileBase = signals.filePath.split('/').pop()?.replace(/\.(t|j)sx?$/, '') ?? signals.filePath
  screens.push({
    filePath: signals.filePath,
    screenId: mainId,
    screenLabel: signals.defaultExportName ?? fileBase,
    screenType,
  })

  for (const d of signals.discriminantStates) {
    for (const value of d.values) {
      screens.push({
        filePath: signals.filePath,
        screenId: `${signals.filePath}#${d.name}-${value}`,
        screenLabel: `${fileBase} — ${value}`,
        screenType: d.name === 'step' || d.name === 'currentStep' || d.name === 'stage' ? 'step' : 'tab',
        parentScreenId: mainId,
      })
    }
  }
  for (const flag of signals.visibilityFlags) {
    screens.push({
      filePath: signals.filePath,
      screenId: `${signals.filePath}#${flag.toLowerCase()}`,
      screenLabel: flag.replace(/^is/, '').replace(/(Visible|Open|Shown|Active)$/, ''),
      screenType: 'overlay',
      parentScreenId: mainId,
    })
  }
  return screens
}

function isTrivial(s: StructuralSignals): boolean {
  // No tabs, no overlays, no panels-style swaps — the file produces exactly
  // one screen, so we don't need to ask the LLM. Saves ~50% of phase 2 tokens
  // on typical projects.
  return s.discriminantStates.length === 0
    && s.visibilityFlags.length === 0
    && s.conditionallyRenderedComponents.length === 0
    && s.modalImports.length === 0
}

async function phase2Decompose(signals: StructuralSignals[]): Promise<ScreenCandidate[]> {
  const allScreens: ScreenCandidate[] = []

  // Split: trivial files go straight to deterministic fallback, complex files
  // batch through the LLM.
  const trivial: StructuralSignals[] = []
  const complex: StructuralSignals[] = []
  for (const s of signals) (isTrivial(s) ? trivial : complex).push(s)
  console.log(`[DiscoveryAgent.phase2] ${trivial.length} trivial, ${complex.length} complex (LLM)`)

  for (const s of trivial) allScreens.push(...fallbackDecompose(s))

  for (let i = 0; i < complex.length; i += PHASE2_BATCH_SIZE) {
    const batch = complex.slice(i, i + PHASE2_BATCH_SIZE)
    try {
      const raw = await chat(PHASE2_PROMPT, buildPhase2UserMessage(batch))
      const parsed = parseJSON<{ screens: ScreenCandidate[] }>(raw)
      if (parsed?.screens && Array.isArray(parsed.screens)) {
        allScreens.push(...parsed.screens.filter((s) => s.filePath && s.screenId))
        continue
      }
    } catch (err) {
      console.warn('[DiscoveryAgent.phase2] batch failed, using fallback:', (err as Error)?.message ?? err)
    }
    for (const s of batch) allScreens.push(...fallbackDecompose(s))
  }
  return allScreens
}

// =============================================================================
// Main entry
// =============================================================================

export async function discoverScreens(rootDir: string): Promise<DiscoveryResult> {
  const tree = buildTree(rootDir)
  if (tree.length === 0) return { screens: [], reason: 'empty project tree' }

  // Phase 1 — broad LLM filter
  const phase1 = await phase1Discovery(tree)
  console.log(`[DiscoveryAgent] phase1 picked ${phase1.candidatePaths.length} candidates: ${phase1.reason}`)

  if (phase1.candidatePaths.length === 0) {
    return { screens: [], reason: phase1.reason }
  }

  // Phase 2 — structural analysis (no LLM)
  const signals = analyzeFiles(rootDir, phase1.candidatePaths)
  console.log(`[DiscoveryAgent] phase2 analyzed ${signals.length} files structurally`)

  // Phase 3 — semantic decomposition (LLM, batched)
  const screens = await phase2Decompose(signals)
  console.log(`[DiscoveryAgent] decomposed into ${screens.length} screens`)

  return { screens, reason: phase1.reason }
}

// Backwards-compat shim for callers still using the old API
export async function discoverPages(rootDir: string): Promise<{ candidatePaths: string[]; reason: string }> {
  const result = await discoverScreens(rootDir)
  // De-duplicate by filePath to keep the AST/Navigation pipeline lean
  const paths = Array.from(new Set(result.screens.map((s) => s.filePath)))
  return { candidatePaths: paths, reason: result.reason }
}
