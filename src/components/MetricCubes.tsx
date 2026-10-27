import type { HealthValues } from '../services/health.service'
import type { WeatherNow } from '../services/weather.service'

const iconStyle = {
  width: '17px',
  height: '17px',
  stroke: 'var(--label)',
  fill: 'none',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const itemStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontVariantNumeric: 'tabular-nums', fontSize: '15px' } as const

const dash = '—'

export function MetricCubes(props: {
  weather: WeatherNow
  health: HealthValues
  onEditHealth: () => void
}) {
  const temp = props.weather.tempC === null ? dash : `${props.weather.tempC}°`
  const wind = props.weather.wind === null ? dash : String(props.weather.wind)
  const sleep = props.health.sleep === undefined ? dash : `${props.health.sleep}h`
  const hr = props.health.restingHr === undefined ? dash : String(props.health.restingHr)
  const steps = props.health.steps === undefined ? dash : String(props.health.steps).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return (
    <div className="metrics-row" style={{ display: 'flex', marginTop: '4px' }}>
      <div className="group group-half" style={{ flex: 1, justifyContent: 'center', gap: '8px' }}>
        <div style={itemStyle}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M7 17h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.6A3.5 3.5 0 0 0 7 17z" />
          </svg>
          <span>{temp}</span>
        </div>
        <div style={itemStyle}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M3 9h9M3 13h12M3 17h8M16 8l4-2M16 12l4 2" />
          </svg>
          <span>{wind}</span>
        </div>
      </div>
      <button
        type="button"
        aria-label="Modifica salute"
        className="group group-half"
        style={{ flex: 1, justifyContent: 'center', gap: '8px', borderLeft: '1px solid var(--sep)', borderRadius: '0 var(--r-card) var(--r-card) 0', cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'left' }}
        onClick={props.onEditHealth}
      >
        <div style={itemStyle}>
          <span style={{ fontWeight: 700, letterSpacing: '-.04em', fontSize: '16px', width: '17px', textAlign: 'center' }}>Z</span>
          <span>{sleep}</span>
        </div>
        <div style={itemStyle}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
          </svg>
          <span>{hr}</span>
        </div>
        <div style={itemStyle}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M4 15.2c1.4-.4 2.6-1.5 3.6-1.5h1.3l1.5-2.8h2.4l1.3 1.3h2.6c1.5 0 2.5.9 2.5 2v.8H5.2c-1 0-1.6-.7-1.2-1.8zM7 15.2v2.2M11 15.5v1.8" />
          </svg>
          <span>{steps}</span>
        </div>
      </button>
    </div>
  )
}
