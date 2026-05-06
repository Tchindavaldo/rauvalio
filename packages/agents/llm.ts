import OpenAI from 'openai'

// Multi-provider LLM client. Pick the active provider via the LLM_PROVIDER env var.
// Each provider exposes an OpenAI-compatible chat/completions endpoint.

export type Provider = 'ollama' | 'cerebras' | 'groq' | 'anthropic' | 'openai'

interface ProviderConfig {
  apiKey: string
  baseURL: string
  model: string
}

const PROVIDERS: Record<Provider, () => ProviderConfig> = {
  ollama: () => ({
    apiKey: 'ollama',
    baseURL: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434/v1',
    model: process.env['OLLAMA_MODEL'] ?? 'qwen2.5-coder:7b',
  }),
  cerebras: () => ({
    apiKey: process.env['CEREBRAS_API_KEY'] ?? '',
    baseURL: 'https://api.cerebras.ai/v1',
    model: process.env['CEREBRAS_MODEL'] ?? 'qwen-3-235b-a22b-instruct-2507',
  }),
  groq: () => ({
    apiKey: process.env['GROQ_API_KEY'] ?? '',
    baseURL: 'https://api.groq.com/openai/v1',
    model: process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile',
  }),
  anthropic: () => ({
    apiKey: process.env['ANTHROPIC_API_KEY'] ?? '',
    baseURL: 'https://api.anthropic.com/v1',
    model: process.env['ANTHROPIC_MODEL'] ?? 'claude-sonnet-4-6',
  }),
  openai: () => ({
    apiKey: process.env['OPENAI_API_KEY'] ?? '',
    baseURL: 'https://api.openai.com/v1',
    model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini',
  }),
}

function getActiveProvider(): Provider {
  const raw = (process.env['LLM_PROVIDER'] ?? 'ollama').toLowerCase()
  if (raw in PROVIDERS) return raw as Provider
  console.warn(`[llm] Unknown LLM_PROVIDER="${raw}", defaulting to ollama`)
  return 'ollama'
}

// Order in which to try fallback providers if the primary fails (rate limit, auth, network).
// Configure via LLM_FALLBACKS="cerebras,ollama". Defaults to none.
function getFallbackChain(): Provider[] {
  const raw = process.env['LLM_FALLBACKS']
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is Provider => s in PROVIDERS)
}

function buildClient(cfg: ProviderConfig): OpenAI {
  return new OpenAI({ apiKey: cfg.apiKey || 'unused', baseURL: cfg.baseURL })
}

export const ACTIVE_PROVIDER: Provider = getActiveProvider()
export const MODEL: string = PROVIDERS[ACTIVE_PROVIDER]().model

async function callProvider(provider: Provider, system: string, user: string): Promise<string> {
  const cfg = PROVIDERS[provider]()
  const client = buildClient(cfg)
  const response = await client.chat.completions.create({
    model: cfg.model,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return response.choices[0]?.message?.content ?? '[]'
}

// Serialize all chat() calls so we never burst > 1 request at a time.
// Combined with a per-provider min interval, this keeps us under tokens/min
// and requests/min limits on free tiers.
let queue: Promise<unknown> = Promise.resolve()
let lastCallAt = 0
const MIN_INTERVAL_MS = Number(process.env['LLM_MIN_INTERVAL_MS'] ?? 1500)

function isRateLimit(err: unknown): boolean {
  const e = err as { status?: number; message?: string }
  if (e?.status === 429) return true
  return typeof e?.message === 'string' && /429|rate[_ ]?limit/i.test(e.message)
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callWithRetry(provider: Provider, system: string, user: string): Promise<string> {
  const maxAttempts = 4
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const elapsed = Date.now() - lastCallAt
      if (elapsed < MIN_INTERVAL_MS) await sleep(MIN_INTERVAL_MS - elapsed)
      lastCallAt = Date.now()
      return await callProvider(provider, system, user)
    } catch (err) {
      if (isRateLimit(err) && attempt < maxAttempts) {
        const backoff = 2000 * 2 ** (attempt - 1) // 2s, 4s, 8s
        console.warn(`[llm] ${provider} rate-limited, retry ${attempt}/${maxAttempts - 1} in ${backoff}ms`)
        await sleep(backoff)
        continue
      }
      throw err
    }
  }
  throw new Error('unreachable')
}

export async function chat(system: string, user: string): Promise<string> {
  // Chain calls so they run strictly sequentially across the whole app
  const previous = queue
  let resolveNext: () => void = () => {}
  queue = new Promise<void>((r) => { resolveNext = r })

  try {
    await previous.catch(() => {})

    const primary = getActiveProvider()
    const fallbacks = getFallbackChain().filter((p) => p !== primary)
    const chain: Provider[] = [primary, ...fallbacks]

    let lastError: unknown
    for (const provider of chain) {
      try {
        return await callWithRetry(provider, system, user)
      } catch (err) {
        lastError = err
        console.warn(`[llm] Provider "${provider}" failed: ${(err as Error)?.message ?? err}`)
      }
    }
    throw lastError ?? new Error('All providers failed')
  } finally {
    resolveNext()
  }
}
