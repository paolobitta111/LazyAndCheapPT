import { describe, expect, it, vi } from 'vitest'
import { chatWithLocalLlm, testLocalLlm } from './local-llm'

describe('testLocalLlm', () => {
  it('stays disabled by default', async () => {
    const result = await testLocalLlm({ enabled: false, endpoint: 'http://127.0.0.1:11434', model: 'local' })
    expect(result.ok).toBe(false)
  })

  it('reports a reachable endpoint without applying output', async () => {
    const result = await testLocalLlm(
      { enabled: true, endpoint: 'http://127.0.0.1:11434/v1', model: 'local' },
      (async () => new Response('{}', { status: 200 })) as typeof fetch,
    )
    expect(result.ok).toBe(true)
    expect(result.message).toContain('validato')
  })
})

describe('chatWithLocalLlm', () => {
  const config = { enabled: true, endpoint: 'http://127.0.0.1:11434/v1', model: 'llama' }
  const messages = [
    { role: 'system' as const, content: 'sei' },
    { role: 'user' as const, content: 'ciao' },
  ]

  it('posts to chat/completions and returns the assistant content', async () => {
    const fetchImpl = vi.fn(async (url: unknown, init?: RequestInit) => {
      expect(String(url)).toBe('http://127.0.0.1:11434/v1/chat/completions')
      expect(JSON.parse(String(init?.body))).toEqual({ model: 'llama', messages })
      return new Response(JSON.stringify({ choices: [{ message: { content: 'Accorcia pure' } }] }), { status: 200 })
    }) as unknown as typeof fetch

    const content = await chatWithLocalLlm(config, messages, fetchImpl)
    expect(content).toBe('Accorcia pure')
  })

  it('throws when disabled', async () => {
    await expect(chatWithLocalLlm({ ...config, enabled: false }, messages)).rejects.toThrow()
  })

  it('throws when the endpoint is empty', async () => {
    await expect(chatWithLocalLlm({ ...config, endpoint: '' }, messages)).rejects.toThrow()
  })

  it('throws on a non-ok response', async () => {
    const fetchImpl = (async () => new Response('{}', { status: 500 })) as unknown as typeof fetch
    await expect(chatWithLocalLlm(config, messages, fetchImpl)).rejects.toThrow()
  })
})
