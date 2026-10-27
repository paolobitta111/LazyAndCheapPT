export function DaySummaryModal(props: {
  dateLabel: string
  title: string
  summary: string
  notes: string
  onClose: () => void
  onAdd?: () => void
}) {
  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <div
        role="dialog"
        aria-label={props.dateLabel}
        className="sheet sheet-bottom"
        style={{ width: 'min(92vw, 380px)', padding: '16px', overflowY: 'auto' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grabber" aria-hidden="true" />
        <p className="t-foot" style={{ margin: 0, color: 'var(--label-2)' }}>{props.dateLabel}</p>
        <h3 className="t-title" style={{ margin: '6px 0 4px' }}>{props.title}</h3>
        <p style={{ margin: 0 }}>{props.summary}</p>
        {props.notes ? (
          <p className="t-sub" style={{ margin: '8px 0 0', color: 'var(--label-2)' }}>{props.notes}</p>
        ) : null}
        {props.onAdd ? (
          <button className="btn btn-tint" type="button" style={{ marginTop: '14px' }} onClick={props.onAdd}>
            Aggiungi allenamento
          </button>
        ) : null}
        <button className="btn" type="button" style={{ marginTop: '14px', marginLeft: props.onAdd ? '6px' : 0 }} onClick={props.onClose}>
          Chiudi
        </button>
      </div>
    </div>
  )
}