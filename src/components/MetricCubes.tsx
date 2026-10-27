import { mockMetrics } from '../pages/today-mock'

const iconStyle = {
  width: '22px',
  height: '22px',
  stroke: '#f5f5f7',
  fill: 'none',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function MetricCubes() {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
      <div className="glass metric-cube" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M7 17h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.6A3.5 3.5 0 0 0 7 17z" />
          </svg>
          <span>{mockMetrics.tempC}°</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M3 9h9M3 13h12M3 17h8M16 8l4-2M16 12l4 2" />
          </svg>
          <span>{mockMetrics.wind}</span>
        </div>
      </div>
      <div className="glass metric-cube" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, letterSpacing: '-.04em', fontSize: '16px', width: '22px', textAlign: 'center' }}>Zzz</span>
          <span>{mockMetrics.sleep}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
          </svg>
          <span>{mockMetrics.restingHr}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStyle}>
            <path d="M4 15.2c1.4-.4 2.6-1.5 3.6-1.5h1.3l1.5-2.8h2.4l1.3 1.3h2.6c1.5 0 2.5.9 2.5 2v.8H5.2c-1 0-1.6-.7-1.2-1.8zM7 15.2v2.2M11 15.5v1.8" />
          </svg>
          <span>{mockMetrics.steps}</span>
        </div>
      </div>
    </div>
  )
}