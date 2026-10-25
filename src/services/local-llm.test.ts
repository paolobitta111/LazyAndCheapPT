import { describe, expect, it } from 'vitest'
import { testLocalLlm } from './local-llm'

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
