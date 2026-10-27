import type { SessionBoxPlan } from './SessionBox'

export function SubstituteCombo(props: {
  schede: SessionBoxPlan[]
  currentId: string | null
  open: boolean
  onToggle: () => void
  onSelect: (planId: string) => void
}) {
  const current = props.schede.find((scheda) => scheda.planId === props.currentId) ?? null
  const face = current ? `${current.name} · oggi` : 'Scegli scheda'
  const choices = props.schede.filter((scheda) => scheda.planId !== props.currentId)

  return (
    <div style={{ position: 'relative', flex: '1.35 1 0' }}>
      <button className="btn" type="button" onClick={props.onToggle}>{face}</button>
      {props.open ? (
        <div
          className="substitute-combo"
          style={{
            position: 'absolute',
            maxHeight: '132px',
            bottom: '100%',
            left: 0,
            right: 0,
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,.28)',
            background: '#1c1c1e',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.28), 0 -8px 24px rgba(0,0,0,.4)',
            zIndex: 3,
          }}
        >
          <div style={{ overflowY: 'auto', maxHeight: '132px' }}>
            {choices.map((scheda) => (
              <button
                key={scheda.planId}
                type="button"
                onClick={() => props.onSelect(scheda.planId)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f5f5f7',
                  background: 'transparent',
                  border: 0,
                  borderBottom: '1px solid rgba(255,255,255,.1)',
                }}
              >
                {scheda.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}