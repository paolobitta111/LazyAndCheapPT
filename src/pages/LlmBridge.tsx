import { useState } from 'react'
import { addSchema, validateAll } from '../data/schema-validator'
import trainingPlanSchema from '../data/schemas/training-plan.json'
import { TrainingPlanService } from '../services/training-plan.service'
import { composeExchange, PRIVACY_REMINDER, type PromptKind } from '../services/llm-prompts'
import { useAppData } from '../data/db'

const PLAN_URI = 'https://lazycheapcoach.dev/schemas/training-plan/v1.0.0'
addSchema(PLAN_URI, trainingPlanSchema)

export default function LlmBridge() {
  const { trainingPlanRepo } = useAppData()
  const service = new TrainingPlanService(trainingPlanRepo)
  const [kind, setKind] = useState<PromptKind>('create-plan')
  const [includeNotes, setIncludeNotes] = useState(false)
  const [contextText, setContextText] = useState('{\n  "goal": "forza"\n}')
  const [responseText, setResponseText] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function selectedContext(): { prompt: string; json: string } | null {
    try {
      return composeExchange(kind, JSON.parse(contextText), includeNotes)
    } catch {
      setMessage('Il contesto non è JSON valido')
      return null
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Copiato. ' + PRIVACY_REMINDER)
    } catch {
      setMessage('Clipboard negata. Seleziona il testo e copialo a mano. ' + PRIVACY_REMINDER)
    }
  }

  function previewImport() {
    const jsonText = responseText.split('---')[0]?.trim() ?? ''
    try {
      const parsed = JSON.parse(jsonText)
      const result = validateAll(PLAN_URI, parsed)
      if (!result.valid) {
        setPreview(null)
        setMessage(result.errors.map((error) => error.message ?? error.keyword).join('; '))
        return
      }
      setPreview(JSON.stringify(parsed, null, 2))
      setMessage('Anteprima pronta. Nessun dato è stato salvato.')
    } catch {
      setMessage('La risposta non contiene JSON valido prima di ---')
    }
  }

  async function confirmImport() {
    if (!preview) return
    if (!window.confirm('Salvare questa scheda come nuova versione?')) return
    let parsed: unknown
    try {
      parsed = JSON.parse(preview)
    } catch {
      setMessage('Anteprima non più valida')
      return
    }
    const created = await service.createFromJson(parsed)
    setMessage(`Scheda salvata: ${created.name} v${created.version}`)
  }

  return (
    <div>
      <h1>Scambio LLM</h1>
      <p className="group t-foot" style={{ color: 'var(--label-2)' }}>{PRIVACY_REMINDER}</p>
      <div className="group">
        <select className="field" value={kind} onChange={(event) => setKind(event.target.value as PromptKind)}>
          <option value="create-plan">Crea scheda</option>
          <option value="revise-plan">Modifica scheda</option>
          <option value="session-feedback">Feedback sessione</option>
          <option value="propose-update">Proponi aggiornamento</option>
        </select>
        <label>
          <input type="checkbox" checked={includeNotes} onChange={(event) => setIncludeNotes(event.target.checked)} /> Includi note
        </label>
        <textarea className="field" rows={8} value={contextText} onChange={(event) => setContextText(event.target.value)} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" type="button" onClick={() => { const packed = selectedContext(); if (packed) void copyText(packed.prompt) }}>Copia prompt</button>
          <button className="btn" type="button" onClick={() => { const packed = selectedContext(); if (packed) void copyText(packed.json) }}>Copia JSON</button>
        </div>
      </div>
      <h2>Risposta</h2>
      <div className="group">
        <textarea className="field" rows={8} value={responseText} onChange={(event) => setResponseText(event.target.value)} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" type="button" onClick={previewImport}>Anteprima</button>
          <button className="btn btn-tint" type="button" disabled={!preview} onClick={confirmImport}>Conferma import</button>
        </div>
        {preview && <pre className="group t-cap nums" style={{ background: 'var(--surface-2)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{preview}</pre>}
      </div>
      {message && <p>{message}</p>}
    </div>
  )
}
