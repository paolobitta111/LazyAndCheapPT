export function AssignModal(props: {
  schede: { planId: string; name: string }[]
  onPick: (planId: string) => void
  onClose: () => void
}) {
  return (
    <div className="day-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={props.onClose}>
      <div
        role="dialog"
        aria-label="Assegna scheda"
        className="glass day-modal"
        style={{ width: 'min(92vw, 380px)', padding: '16px', margin: '16px' }}
        onClick={(event) => event.stopPropagation()}
      >
        <p style={{ margin: '0 0 10px', color: 'rgba(245,245,247,.55)', fontSize: '13px' }}>
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