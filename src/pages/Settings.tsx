import { useState } from 'react'
import { BackupServiceImpl } from '../data/repositories.dexie'
import { buildBackupZip, readBackupZip, type BackupPreview } from '../services/backup-zip'
import { loadLocalLlmConfig, saveLocalLlmConfig, testLocalLlm, type LocalLlmConfig } from '../services/local-llm'

export default function Settings() {
  const [preview, setPreview] = useState<BackupPreview | null>(null)
  const [pending, setPending] = useState<Uint8Array | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [llm, setLlm] = useState<LocalLlmConfig>(loadLocalLlmConfig())

  async function exportZip() {
    const data = await new BackupServiceImpl().exportAll()
    const bytes = buildBackupZip(data)
    const copy = new ArrayBuffer(bytes.byteLength)
    new Uint8Array(copy).set(bytes)
    const blob = new Blob([copy], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lazycheapcoach-backup.zip'
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Backup esportato. I dati restano locali.')
  }

  async function restore() {
    if (!pending || !preview) return
    if (!window.confirm('Sostituire tutti i dati locali con questo backup?')) return
    const { data } = readBackupZip(pending)
    await new BackupServiceImpl().replaceAll(data)
    setMessage('Ripristino completato.')
  }

  return (
    <div className="container">
      <h1 className="title is-4">Impostazioni</h1>
      <p className={offline ? 'has-text-warning' : 'has-text-success'}>
        {offline ? 'Offline: i dati già salvati restano consultabili.' : 'Online. I log sono comunque salvati in locale.'}
      </p>
      <button className="button is-small mb-4" type="button" onClick={() => setOffline(!navigator.onLine)}>Aggiorna stato rete</button>
      <h2 className="title is-5">Backup</h2>
      <button className="button is-primary mb-3" type="button" onClick={exportZip}>Esporta ZIP</button>
      <input
        type="file"
        accept=".zip,application/zip"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const bytes = new Uint8Array(await file.arrayBuffer())
          try {
            const parsed = readBackupZip(bytes)
            setPending(bytes)
            setPreview(parsed.preview)
            setMessage('Anteprima pronta. Nessuna sostituzione finché non confermi.')
          } catch (error) {
            setPreview(null)
            setMessage(error instanceof Error ? error.message : 'ZIP non valido')
          }
        }}
      />
      {preview && (
        <div className="box">
          <p>Creato: {preview.createdAt ?? 'sconosciuto'}</p>
          <p>GPX: {preview.gpxFiles}</p>
          <pre>{JSON.stringify(preview.counts, null, 2)}</pre>
          <button className="button is-danger" type="button" onClick={restore}>Sostituisci dati locali</button>
        </div>
      )}
      <h2 className="title is-5 mt-5">LLM locale opzionale</h2>
      <p className="help">Disabilitato di default. Non è richiesto per usare l&apos;app. Le credenziali non entrano nel backup.</p>
      <label className="checkbox">
        <input type="checkbox" checked={llm.enabled} onChange={(event) => setLlm({ ...llm, enabled: event.target.checked })} /> Abilita
      </label>
      <input className="input mt-2" placeholder="http://indirizzo-lan:11434/v1" value={llm.endpoint} onChange={(event) => setLlm({ ...llm, endpoint: event.target.value })} />
      <input className="input mt-2" placeholder="modello" value={llm.model} onChange={(event) => setLlm({ ...llm, model: event.target.value })} />
      <div className="buttons mt-3">
        <button className="button" type="button" onClick={() => { saveLocalLlmConfig(llm); setMessage('Configurazione locale salvata sul dispositivo.') }}>Salva</button>
        <button className="button" type="button" onClick={async () => setMessage((await testLocalLlm(llm)).message)}>Prova connessione</button>
      </div>
      {message && <p className="mt-3">{message}</p>}
    </div>
  )
}
