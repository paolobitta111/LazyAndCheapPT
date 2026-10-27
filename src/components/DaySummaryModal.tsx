export function DaySummaryModal(props: {
  dateLabel: string
  title: string
  summary: string
  notes: string
  onClose: () => void
  onAdd?: () => void
}) {
  return (
    <div
      className="day-modal-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
      onClick={props.onClose}
    >
      <div
        role="dialog"
        aria-label={props.dateLabel}
        className="sheet day-modal"
        style={{ width: 'min(92vw, 380px)', padding: '16px', margin: '16px' }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="t-foot" style={{ margin: 0, color: 'var(--label-2)' }}>{props.dateLabel}</p>
        <h3 className="t-title" style={{ margin: '6px 0 4px' }}>{props.title}</h3>
        <p style={{ margin: 0 }}>{props.summary}</p>
        {props.notes ? (
          <p className="t-sub" style={{ margin: '8px 0 0', color: 'var(--label-2)' }}>{props.notes}</p>
        ) : null}
        {props.onAdd ? (
          <button className="btn" type="button" style={{ marginTop: '14px' }} onClick={props.onAdd}>
            Aggiungi allenamento
          </button>
        ) : null}
        <button
          className={props.onAdd ? 'btn btn-tint' : 'btn'}
          type="button"
          style={{ marginTop: '14px', marginLeft: props.onAdd ? '6px' : 0 }}
          onClick={props.onClose}
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}