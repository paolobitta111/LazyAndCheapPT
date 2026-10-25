export const MAX_GPX_BYTES = 15 * 1024 * 1024

export interface GpxInspection {
  valid: boolean
  errors: string[]
  pointCount: number
  distanceKm: number
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLon - aLon)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function inspectGpx(xml: string): GpxInspection {
  const errors: string[] = []
  const bytes = new TextEncoder().encode(xml).byteLength
  if (!xml.trim()) errors.push('File vuoto')
  if (bytes > MAX_GPX_BYTES) errors.push('GPX oltre 15MB')
  if (!/<gpx[\s>]/i.test(xml)) errors.push('Manca l\'elemento gpx')
  const tags = xml.match(/<trkpt\b[^>]*>/gi) ?? []
  const points = tags.flatMap((tag) => {
    const lat = tag.match(/\blat="([^"]+)"/i)?.[1]
    const lon = tag.match(/\blon="([^"]+)"/i)?.[1]
    if (!lat || !lon) return []
    const latN = Number(lat)
    const lonN = Number(lon)
    if (!Number.isFinite(latN) || !Number.isFinite(lonN)) return []
    return [{ lat: latN, lon: lonN }]
  })
  let distanceKm = 0
  for (let i = 1; i < points.length; i += 1) {
    distanceKm += haversineKm(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon)
  }
  return { valid: errors.length === 0, errors, pointCount: points.length, distanceKm }
}

export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}
