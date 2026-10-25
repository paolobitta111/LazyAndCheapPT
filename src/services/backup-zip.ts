import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import type { BackupExport, GpxAttachment } from '../models/entities'

export interface BackupPreview {
  createdAt?: string
  counts: Record<string, number>
  gpxFiles: number
}

function decodeFile(fileData: string): Uint8Array {
  const trimmed = fileData.trim()
  if (trimmed.startsWith('<') || trimmed.startsWith('<?xml')) return strToU8(trimmed)
  const binary = atob(trimmed)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function encodeFile(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export function buildBackupZip(data: BackupExport): Uint8Array {
  const gpxFiles: Record<string, Uint8Array> = {}
  const attachments: GpxAttachment[] = data.gpxAttachments.map((attachment) => {
    const name = `gpx/${attachment.id ?? attachment.fileName}`
    gpxFiles[name] = decodeFile(attachment.fileData)
    return { ...attachment, fileData: name }
  })
  const payload: BackupExport = { ...data, gpxAttachments: attachments }
  const counts = {
    trainingPlans: data.trainingPlans.length,
    plannedSessions: data.plannedSessions.length,
    workoutLogs: data.workoutLogs.length,
    cardioLogs: data.cardioLogs.length,
    gpxAttachments: data.gpxAttachments.length,
  }
  const manifest = {
    schemaVersion: '1.0.0',
    documentType: 'backup',
    createdAt: data.timestamp,
    counts,
  }
  return zipSync({
    'manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
    'data.json': strToU8(JSON.stringify(payload)),
    ...gpxFiles,
  })
}

export function readBackupZip(bytes: Uint8Array): { preview: BackupPreview; data: BackupExport } {
  const files = unzipSync(bytes)
  if (!files['manifest.json'] || !files['data.json']) {
    throw new Error('Backup ZIP incompleto')
  }
  let manifest: { createdAt?: string; counts?: Record<string, number> }
  let data: BackupExport
  try {
    manifest = JSON.parse(strFromU8(files['manifest.json'])) as { createdAt?: string; counts?: Record<string, number> }
    data = JSON.parse(strFromU8(files['data.json'])) as BackupExport
  } catch {
    throw new Error('Backup ZIP non è JSON valido')
  }
  data.gpxAttachments = data.gpxAttachments.map((attachment) => {
    const file = files[attachment.fileData]
    if (!file) return attachment
    return { ...attachment, fileData: encodeFile(file) }
  })
  return {
    preview: {
      createdAt: manifest.createdAt,
      counts: manifest.counts ?? {},
      gpxFiles: Object.keys(files).filter((name) => name.startsWith('gpx/')).length,
    },
    data,
  }
}
