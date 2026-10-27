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
    <div>
      <h1>Impostazioni</h1>
      <div className="group">
        <p className="t-sub" style={{ color: 'var(--label-2)' }}>
          {offline ? 'Offline: i dati già salvati restano consultabili.' : 'Online. I log sono comunque salvati in locale.'}
        </p>
        <button className="btn" type="button" onClick={() => setOffline(!navigator.onLine)}>Aggiorna stato rete</button>
      </div>
      <h2>Backup</h2>
      <div className="group">
        <button className="btn btn-tint" type="button" onClick={exportZip}>Esporta ZIP</button>
        <label className="btn">
          Scegli file ZIP
          <input
            type="file"
            accept=".zip,application/zip"
            style={{ display: 'none' }}
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
        </label>
        {preview && (
          <div className="group" style={{ background: 'var(--surface-2)' }}>
            <p>Creato: {preview.createdAt ?? 'sconosciuto'}</p>
            <p>GPX: {preview.gpxFiles}</p>
            <pre className="t-cap nums" style={{ overflowX: 'auto' }}>{JSON.stringify(preview.counts, null, 2)}</pre>
            <button className="btn" type="button" onClick={restore}>Sostituisci dati locali</button>
          </div>
        )}
      </div>
      <h2>LLM locale opzionale</h2>
      <div className="group">
        <p className="t-sub" style={{ color: 'var(--label-2)' }}>Disabilitato di default. Non è richiesto per usare l&apos;app. Le credenziali non entrano nel backup.</p>
        <label>
          <input type="checkbox" checked={llm.enabled} onChange={(event) => setLlm({ ...llm, enabled: event.target.checked })} /> Abilita
        </label>
        <input className="field" placeholder="http://indirizzo-lan:11434/v1" value={llm.endpoint} onChange={(event) => setLlm({ ...llm, endpoint: event.target.value })} />
        <input className="field" placeholder="modello" value={llm.model} onChange={(event) => setLlm({ ...llm, model: event.target.value })} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" type="button" onClick={() => { saveLocalLlmConfig(llm); setMessage('Configurazione locale salvata sul dispositivo.') }}>Salva</button>
          <button className="btn" type="button" onClick={async () => setMessage((await testLocalLlm(llm)).message)}>Prova connessione</button>
        </div>
      </div>
      {message && <p>{message}</p>}
    </div>
  )
}
