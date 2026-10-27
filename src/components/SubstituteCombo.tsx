import type { MockScheda } from '../pages/today-mock'

export function SubstituteCombo(props: {
  schede: MockScheda[]
  currentId: string | null
  open: boolean
  onToggle: () => void
  onSelect: (id: string) => void
}) {
  const current = props.schede.find((scheda) => scheda.id === props.currentId) ?? null
  const face = current ? `${current.name} · oggi` : 'Scegli scheda'
  const choices = props.schede.filter((scheda) => scheda.id !== props.currentId)

  return (
    <div style={{ position: 'relative', flex: '1.35 1 0' }}>
      <button className="btn" type="button" onClick={props.onToggle}>{face}</button>
      {props.open ? (
        <div
          className="substitute-combo"
          style={{ position: 'absolute', maxHeight: '132px', bottom: '100%', left: 0, right: 0 }}
        >
          <div style={{ overflowY: 'auto', maxHeight: '132px' }}>
            {choices.map((scheda) => (
              <button key={scheda.id} type="button" onClick={() => props.onSelect(scheda.id)}>
                {scheda.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
