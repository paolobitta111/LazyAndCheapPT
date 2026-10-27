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
    <section className="group" aria-label={props.plan ? props.plan.name : 'Riposo'}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <h3 className="t-title" style={{ margin: 0, cursor: props.plan ? 'pointer' : 'default' }} onClick={props.plan ? props.onOpen : undefined}>
          {props.plan ? props.plan.name : 'Riposo'}
        </h3>
        {props.plan ? <span className="badge">Previsto</span> : null}
      </div>
      <p className="t-sub" style={{ margin: 0, color: 'var(--label-2)' }}>
        {props.plan ? props.plan.description || props.plan.name : 'Nessuna sessione'}
      </p>
      <div className="session-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '8px', position: 'relative', zIndex: 2 }}>
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
        <button className="btn-tint" type="button" onClick={props.onCheckIn}>AI Check-In</button>
      </div>
    </section>
  )
}
