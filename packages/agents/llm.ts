import OpenAI from 'openai'

// Dev : Groq (gratuit) — Prod : Anthropic (claude-sonnet-4-6 via @anthropic-ai/sdk)
// Pour basculer en prod : changer baseURL + apiKey + model dans ce seul fichier.

const isProduction = process.env['NODE_ENV'] === 'production'

function createClient() {
  if (isProduction) {
    // Prod : OpenAI-compatible wrapper sur Anthropic (ou remplacer par @anthropic-ai/sdk)
    return new OpenAI({
      apiKey: process.env['ANTHROPIC_API_KEY'] ?? '',
      baseURL: 'https://api.anthropic.com/v1',
    })
  }
  // Dev : Groq (gratuit, Llama 3.3 70B)
  return new OpenAI({
    apiKey: process.env['GROQ_API_KEY'] ?? '',
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

export const MODEL = isProduction ? 'claude-sonnet-4-6' : 'llama-3.3-70b-versatile'

export async function chat(system: string, user: string): Promise<string> {
  const client = createClient()
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return response.choices[0]?.message?.content ?? '[]'
}
