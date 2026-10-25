import { describe, expect, it } from 'vitest'
import type { BackupExport } from '../models/entities'
import { buildBackupZip, readBackupZip } from './backup-zip'

describe('backup-zip', () => {
  it('round-trips data and gpx bytes', () => {
    const xml = '<gpx version="1.1"></gpx>'
    const data: BackupExport = {
      timestamp: '2026-10-25T00:00:00.000Z',
      version: '1.0.0',
      trainingPlans: [],
      plannedSessions: [],
      calendarEntries: [],
      workoutLogs: [],
      exerciseLogs: [],
      setLogs: [],
      cardioLogs: [],
      gpxAttachments: [{
        id: 'g1',
        createdAt: new Date('2026-10-25'),
        updatedAt: new Date('2026-10-25'),
        fileName: 'run.gpx',
        fileData: xml,
        uploadedAt: new Date('2026-10-25'),
      }],
    }
    const zip = buildBackupZip(data)
    const restored = readBackupZip(zip)
    expect(restored.preview.gpxFiles).toBe(1)
    expect(restored.preview.counts.gpxAttachments).toBe(1)
    expect(atob(restored.data.gpxAttachments[0].fileData)).toBe(xml)
  })
})
