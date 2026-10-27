export function formatToday(date = new Date()): string {
  const label = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export type MockSport = 'running' | 'strength' | 'cycling'

export interface MockScheda {
  id: string
  name: string
  subtitle: string
  sport: MockSport
}

export const mockSchede: MockScheda[] = [
  { id: 'corsa', name: 'Corsa', subtitle: 'Fondo lento · 40 min · zona 2', sport: 'running' },
  { id: 'palestra-1', name: 'Palestra giorno 1', subtitle: 'Sessione registrata', sport: 'strength' },
  { id: 'bici', name: 'Bici', subtitle: 'Sessione registrata', sport: 'cycling' },
  { id: 'petto', name: 'Petto + tricipiti', subtitle: 'Sessione registrata', sport: 'strength' },
  { id: 'schiena', name: 'Schiena + bicipiti', subtitle: 'Sessione registrata', sport: 'strength' },
  { id: 'gambe', name: 'Gambe + addome', subtitle: 'Sessione registrata', sport: 'strength' },
  { id: 'corsa-intervalli', name: 'Corsa intervalli', subtitle: 'Sessione registrata', sport: 'running' },
]

export const initialSchedaId = 'corsa'

export interface MockDaySession {
  day: number
  schedaId: string
  summary: string
  notes: string
}

export const octoberYear = 2026
export const octoberMonthIndex = 9

const octoberDays: Array<[number, string]> = [
  [2, 'palestra-1'],
  [4, 'corsa'],
  [6, 'bici'],
  [8, 'palestra-1'],
  [11, 'corsa'],
  [13, 'palestra-1'],
  [15, 'bici'],
  [18, 'corsa'],
  [20, 'palestra-1'],
  [22, 'bici'],
  [23, 'corsa'],
]

export const octoberSessions: MockDaySession[] = octoberDays.map(([day, schedaId]) => ({
  day,
  schedaId,
  summary: day === 23 ? '32 min · 5,1 km' : 'Sessione registrata',
  notes: day === 23 ? 'Ginocchio ok. Ritmo comodo.' : '',
}))

export const mockMetrics = {
  tempC: 14,
  wind: 8,
  sleep: '7h 12',
  restingHr: 52,
  steps: '3.240',
}

export function buildCheckInPrompt(label: string, message: string): string {
  return `Check-in di oggi.\nScheda: ${label}\nMessaggio: ${message}`
}
