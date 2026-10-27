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
    <div style={{ position: 'relative', flex: '1.35 1 0', minWidth: 0 }}>
      <button className="btn" type="button" onClick={props.onToggle}>{face}</button>
      {props.open ? (
        <div
          className="menu substitute-menu"
          style={{
            position: 'absolute',
            maxHeight: '132px',
            bottom: '100%',
            left: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          <div style={{ overflowY: 'auto', maxHeight: '132px' }}>
            {choices.map((scheda) => (
              <button
                key={scheda.planId}
                type="button"
                className="menu-item"
                onClick={() => props.onSelect(scheda.planId)}
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
