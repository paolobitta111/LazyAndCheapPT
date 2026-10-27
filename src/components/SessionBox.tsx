import { useState } from 'react'
import { SubstituteCombo } from './SubstituteCombo'

export interface SessionBoxPlan {
  planId: string
  name: string
  description: string
}

export function SessionBox(props: {
  plan: SessionBoxPlan | null
  schede: SessionBoxPlan[]
  onSkip: () => void
  onSelect: (planId: string) => void
  onCheckIn: () => void
  onOpen: () => void
}) {
  const [open, setOpen] = useState(false)

  function select(planId: string) {
    setOpen(false)
    props.onSelect(planId)
  }

  return (
    <section className="glass" aria-label={props.plan ? props.plan.name : 'Riposo'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <h3
          style={{ margin: 0, fontSize: '22px', fontWeight: 400, color: '#f5f5f7', cursor: props.plan ? 'pointer' : 'default' }}
          onClick={props.plan ? props.onOpen : undefined}
        >
          {props.plan ? props.plan.name : 'Riposo'}
        </h3>
        {props.plan ? (
          <span style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '999px', background: 'rgba(255,107,74,.18)', color: '#ffb4a2' }}>
            Previsto
          </span>
        ) : null}
      </div>
      <p style={{ margin: '8px 0 0', color: 'rgba(245,245,247,.55)', fontSize: '15px' }}>
        {props.plan ? props.plan.description || props.plan.name : 'Nessuna sessione'}
      </p>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginTop: '22px', position: 'relative', zIndex: 2 }}>
        {props.plan ? (
          <button className="btn" type="button" onClick={props.onSkip}>Salta</button>
        ) : null}
        <SubstituteCombo
          schede={props.schede}
          currentId={props.plan?.planId ?? null}
          open={open}
          onToggle={() => setOpen((value) => !value)}
          onSelect={select}
        />
        <button className="btn btn-primary" type="button" onClick={props.onCheckIn}>AI Check-In</button>
      </div>
    </section>
  )
}