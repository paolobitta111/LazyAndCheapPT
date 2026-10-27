// ============================================================================
// Health — hand-entered values (Apple Health is not reachable from a PWA)
// ============================================================================

export interface HealthValues {
  sleep?: number
  restingHr?: number
  steps?: number
}

const STORAGE_KEY = 'lcc.health'

export function loadHealth(): HealthValues {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as HealthValues
  } catch {
    return {}
  }
}

export function saveHealth(values: HealthValues): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
}