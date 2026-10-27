export type PromptKind = 'create-plan' | 'revise-plan' | 'session-feedback' | 'propose-update'

export const PRIVACY_REMINDER = 'Il testo copiato può contenere note e metriche personali. Incollalo solo in un servizio di cui ti fidi.'

const INSTRUCTIONS: Record<PromptKind, string> = {
  'create-plan': 'Crea una scheda. Rispondi con JSON valido schemaVersion 1.0.0 documentType training-plan, poi un riepilogo dopo la riga ---',
  'revise-plan': 'Proponi una nuova versione della scheda. Non modificare lo storico. JSON valido, poi riepilogo dopo ---',
  'session-feedback': 'Valuta la sessione usando solo il contesto selezionato. Separa JSON e riepilogo con ---',
  'propose-update': 'Proponi un aggiornamento della scheda in JSON valido, poi il riepilogo dopo ---',
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

function stripNotes(value: JsonValue, includeNotes: boolean): JsonValue {
  if (!includeNotes && value && typeof value === 'object') {
    if (Array.isArray(value)) return value.map((item) => stripNotes(item, includeNotes))
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'notes')
        .map(([key, item]) => [key, stripNotes(item, includeNotes)]),
    )
  }
  return value
}

export function composeExchange(
  kind: PromptKind,
  selected: JsonValue,
  includeNotes = false,
): { prompt: string; json: string } {
  const json = JSON.stringify(stripNotes(selected, includeNotes), null, 2)
  const prompt = `${INSTRUCTIONS[kind]}\n\nContesto JSON:\n${json}`
  return { prompt, json }
}

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------

export function buildCheckInPrompt(label: string, message: string): string {
  return `Check-in di oggi.\nScheda: ${label}\nMessaggio: ${message}`
}

export interface CheckInMetrics {
  sleep?: number
  restingHr?: number
  steps?: number
  tempC?: number | null
  wind?: number | null
}

export function buildCheckInSystemPrompt(label: string, metrics: CheckInMetrics): string {
  const parts: string[] = []
  if (metrics.sleep !== undefined) parts.push(`sonno ${metrics.sleep}h`)
  if (metrics.restingHr !== undefined) parts.push(`FC riposo ${metrics.restingHr}`)
  if (metrics.steps !== undefined) parts.push(`passi ${metrics.steps}`)
  if (metrics.tempC != null) parts.push(`temperatura ${metrics.tempC}°`)
  if (metrics.wind != null) parts.push(`vento ${metrics.wind}`)
  const context = parts.length > 0 ? ` Metriche di oggi: ${parts.join(', ')}.` : ''
  return (
    `Sei il coach di LazyCheapCoach. La sessione di oggi è: ${label}.` +
    context +
    ' Rispondi in italiano, breve e pratico. Una modifica proposta vale solo per oggi.'
  )
}
