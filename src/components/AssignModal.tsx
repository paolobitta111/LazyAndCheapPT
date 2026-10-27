export function AssignModal(props: {
  schede: { planId: string; name: string }[]
  onPick: (planId: string) => void
  onClose: () => void
}) {
  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <div
        role="dialog"
        aria-label="Assegna scheda"
        className="sheet sheet-bottom"
        style={{ width: 'min(92vw, 380px)', overflowY: 'auto' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grabber" aria-hidden="true" />
        <p className="t-foot" style={{ margin: '0 0 10px', color: 'var(--label-2)' }}>
          Assegna una scheda a questo giorno
        </p>
        {props.schede.map((scheda) => (
          <button
            key={scheda.planId}
            type="button"
            className="btn"
            style={{ width: '100%', marginBottom: '6px' }}
            onClick={() => props.onPick(scheda.planId)}
          >
            {scheda.name}
          </button>
        ))}
        <button className="btn" type="button" style={{ marginTop: '8px' }} onClick={props.onClose}>Chiudi</button>
      </div>
    </div>
  )
}
