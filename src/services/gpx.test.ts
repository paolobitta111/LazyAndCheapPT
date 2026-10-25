import { describe, expect, it } from 'vitest'
import { inspectGpx } from './gpx'

const sample = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
<trkpt lat="45.0" lon="9.0"></trkpt>
<trkpt lat="45.01" lon="9.0"></trkpt>
</trkseg></trk></gpx>`

describe('inspectGpx', () => {
  it('accepts a track and estimates distance', () => {
    const result = inspectGpx(sample)
    expect(result.valid).toBe(true)
    expect(result.pointCount).toBe(2)
    expect(result.distanceKm).toBeGreaterThan(1)
  })

  it('rejects non-gpx text', () => {
    expect(inspectGpx('<html></html>').valid).toBe(false)
  })
})
