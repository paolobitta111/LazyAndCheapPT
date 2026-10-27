import { useState } from 'react'
import {
  buildCheckInPrompt,
  buildCheckInSystemPrompt,
  type CheckInMetrics,
} from '../services/llm-prompts'
import { chatWithLocalLlm, loadLocalLlmConfig, type ChatMessage as LlmChatMessage } from '../services/local-llm'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export function CheckInModal(props: {
  open: boolean
  label: string
  promptLabel: string
  metrics: CheckInMetrics
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [offline, setOffline] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [promptShown, setPromptShown] = useState<string | null>(null)

  if (!props.open) return null

  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.text ?? ''
  const prompt = lastUserMessage ? buildCheckInPrompt(props.promptLabel, lastUserMessage) : ''

  function send() {
    const text = draft.trim()
    if (!text) return
    const userMessage: ChatMessage = { role: 'user', text }
    setMessages((previous) => [...previous, userMessage])
    setDraft('')
    void replyTo(userMessage)
  }

  async function replyTo(userMessage: ChatMessage) {
    const config = loadLocalLlmConfig()
    if (!config.enabled || !config.endpoint) {
      setOffline(true)
      return
    }
    const history: LlmChatMessage[] = [
      { role: 'system', content: buildCheckInSystemPrompt(props.promptLabel, props.metrics) },
      ...messages.map((message) => ({ role: message.role, content: message.text })),
      { role: 'user', content: userMessage.text },
    ]
    try {
      const content = await chatWithLocalLlm(config, history)
      setMessages((previous) => [...previous, { role: 'assistant', text: content }])
    } catch {
      setOffline(true)
    }
  }

  async function copyPrompt(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  async function exportPrompt() {
    if (!prompt) return
    if (await copyPrompt(prompt)) {
      setStatus('Prompt copiato.')
      setPromptShown(null)
    } else {
      setStatus(null)
      setPromptShown(prompt)
    }
  }

  async function sharePrompt() {
    if (!prompt) return
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: prompt })
        setStatus('Prompt condiviso.')
        setPromptShown(null)
        return
      } catch {
        // falls through to the clipboard copy below
      }
    }
    if (await copyPrompt(prompt)) {
      setStatus('Condivisione non disponibile. Prompt copiato.')
      setPromptShown(null)
    } else {
      setStatus('Condivisione non disponibile. Seleziona il testo.')
      setPromptShown(prompt)
    }
  }

  function confirmImport() {
    const text = importText.trim()
    if (!text) return
    setMessages((previous) => [...previous, { role: 'assistant', text }])
    setImportText('')
    setImportOpen(false)
  }

  return (
    <div
      className="checkin-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
      onClick={props.onClose}
    >
      <div
        role="dialog"
        aria-label={`Check-in · ${props.label}`}
        className="glass checkin-dialog"
        style={{ width: 'min(92vw, 420px)', maxHeight: '80vh', overflowY: 'auto', padding: '16px' }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="checkin-eyebrow" style={{ margin: 0, color: 'rgba(245,245,247,.55)', fontSize: '13px' }}>
          Check-in · {props.label}
        </p>
        <h3 style={{ margin: '6px 0 12px', fontSize: '18px', fontWeight: 500 }}>Chat</h3>

        {messages.map((message, index) => (
          <p
            key={index}
            data-role={message.role}
            className={message.role === 'user' ? 'checkin-bubble-user' : 'checkin-bubble-assistant'}
            style={{
              maxWidth: '86%',
              marginLeft: message.role === 'user' ? 'auto' : undefined,
              marginRight: message.role === 'user' ? 0 : 'auto',
              padding: '10px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              lineHeight: 1.35,
              background: message.role === 'user' ? '#f5f5f7' : 'rgba(255,255,255,.08)',
              color: message.role === 'user' ? '#0b0b0d' : '#f5f5f7',
              borderBottomRightRadius: message.role === 'user' ? '6px' : undefined,
              borderBottomLeftRadius: message.role === 'assistant' ? '6px' : undefined,
            }}
          >
            {message.text}
          </p>
        ))}

        {offline ? (
          <div style={{ marginTop: '12px', padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)' }}>
            <strong style={{ fontSize: '14px' }}>Nessun modello collegato</strong>
            <p style={{ margin: '4px 0 10px', fontSize: '14px', color: 'rgba(245,245,247,.8)' }}>
              Il prompt è pronto. Passalo a un'altra AI, poi riporta qui la risposta.
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn" type="button" onClick={() => void exportPrompt()}>Esporta</button>
              <button className="btn" type="button" onClick={() => void sharePrompt()}>Condividi</button>
            </div>
            <button className="btn" type="button" style={{ width: '100%', marginTop: '8px' }} onClick={() => setImportOpen(true)}>
              Importa risposta
            </button>
          </div>
        ) : null}

        {promptShown ? <pre className="checkin-prompt" style={{ marginTop: '10px', whiteSpace: 'pre-wrap', fontSize: '12px' }}>{promptShown}</pre> : null}
        {status ? <p className="checkin-status" style={{ margin: '10px 0 0', fontSize: '14px' }}>{status}</p> : null}

        {importOpen ? (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              className="field"
              rows={4}
              placeholder="Incolla la risposta…"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
            />
            <button className="btn" type="button" onClick={confirmImport}>Aggiungi</button>
          </div>
        ) : null}

        <div className="checkin-composer" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
          <input
            className="field"
            style={{ flex: 1 }}
            placeholder="Scrivi…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="button"
            aria-label="Invia"
            className="checkin-send"
            style={{
              width: '40px',
              height: '40px',
              flex: 'none',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,.22)',
              background: 'linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.05))',
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            onClick={send}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ width: '18px', height: '18px', stroke: '#f5f5f7', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}
            >
              <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />
            </svg>
          </button>
        </div>

        <button className="btn" type="button" style={{ marginTop: '10px' }} onClick={props.onClose}>Chiudi</button>
      </div>
    </div>
  )
}