import { useState } from 'react'
import type { MockScheda } from '../pages/today-mock'
import { SubstituteCombo } from './SubstituteCombo'

export function SessionBox(props: {
  scheda: MockScheda | null
  schede: MockScheda[]
  onSkip: () => void
  onSelect: (id: string) => void
  onCheckIn: () => void
}) {
  const [open, setOpen] = useState(false)

  function select(id: string) {
    setOpen(false)
    props.onSelect(id)
  }

  return (
    <section className="glass">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 400, color: '#f5f5f7' }}>
          {props.scheda ? props.scheda.name : 'Riposo'}
        </h2>
        {props.scheda ? (
          <span style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '999px', background: 'rgba(255,107,74,.18)', color: '#ffb4a2' }}>
            Previsto
          </span>
        ) : null}
      </div>
      <p style={{ margin: '8px 0 0', color: 'rgba(245,245,247,.55)' }}>
        {props.scheda ? props.scheda.subtitle : 'Nessuna sessione'}
      </p>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginTop: '22px' }}>
        {props.scheda ? (
          <button className="btn" type="button" onClick={props.onSkip}>Salta</button>
        ) : null}
        <SubstituteCombo
          schede={props.schede}
          currentId={props.scheda?.id ?? null}
          open={open}
          onToggle={() => setOpen((value) => !value)}
          onSelect={select}
        />
        <button className="btn btn-primary" type="button" onClick={props.onCheckIn}>AI Check-In</button>
      </div>
    </section>
  )
}
