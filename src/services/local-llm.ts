export interface LocalLlmConfig {
  enabled: boolean
  endpoint: string
  model: string
}

const STORAGE_KEY = 'lcc.localLlm'

export const defaultLocalLlmConfig: LocalLlmConfig = {
  enabled: false,
  endpoint: '',
  model: '',
}

export function loadLocalLlmConfig(): LocalLlmConfig {
  if (typeof localStorage === 'undefined') return defaultLocalLlmConfig
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultLocalLlmConfig
  let parsed: Partial<LocalLlmConfig>
  try {
    parsed = JSON.parse(raw) as Partial<LocalLlmConfig>
  } catch {
    return defaultLocalLlmConfig
  }
  return {
    enabled: parsed.enabled === true,
    endpoint: parsed.endpoint ?? '',
    model: parsed.model ?? '',
  }
}

export function saveLocalLlmConfig(config: LocalLlmConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    enabled: config.enabled,
    endpoint: config.endpoint,
    model: config.model,
  }))
}

export async function testLocalLlm(
  config: LocalLlmConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; message: string }> {
  if (!config.enabled) return { ok: false, message: 'Provider locale disabilitato' }
  if (!config.endpoint) return { ok: false, message: 'Endpoint mancante' }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetchImpl(new URL('/models', config.endpoint).toString(), { signal: controller.signal })
    if (!response.ok) return { ok: false, message: `HTTP ${response.status}` }
    return { ok: true, message: 'Connessione ok. L\'output va comunque validato prima di applicarlo.' }
  } catch {
    return { ok: false, message: 'Connessione fallita. Su telefono localhost non è il PC; HTTPS può bloccare HTTP.' }
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------
// Chat (OpenAI-compatible /chat/completions)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatWithLocalLlm(
  config: LocalLlmConfig,
  messages: ChatMessage[],
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  if (!config.enabled) throw new Error('Provider locale disabilitato')
  if (!config.endpoint) throw new Error('Endpoint mancante')
  const url = `${config.endpoint.replace(/\/$/, '')}/chat/completions`
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.model, messages }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Risposta senza contenuto')
  return content
}
