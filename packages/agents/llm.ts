import OpenAI from 'openai'

// Dev : Groq (gratuit) — Prod : Anthropic (claude-sonnet-4-6 via @anthropic-ai/sdk)
// Pour basculer en prod : changer baseURL + apiKey + model dans ce seul fichier.

const isProduction = process.env['NODE_ENV'] === 'production'

function createClient() {
  if (isProduction) {
    return new OpenAI({
      apiKey: process.env['ANTHROPIC_API_KEY'] ?? '',
      baseURL: 'https://api.anthropic.com/v1',
    })
  }
  // Dev : Ollama local (qwen2.5-coder:7b) — pas de rate limit, pas de clé
  return new OpenAI({
    apiKey: 'ollama',
    baseURL: 'http://localhost:11434/v1',
  })
}

export const MODEL = isProduction ? 'claude-sonnet-4-6' : 'qwen2.5-coder:7b'

export async function chat(system: string, user: string): Promise<string> {
  const client = createClient()
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return response.choices[0]?.message?.content ?? '[]'
}
