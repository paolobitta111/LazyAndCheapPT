import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Cardio from './Cardio'
import { DataProvider, db } from '../data/db'

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Cardio', () => {
  it('keys a saved session to the local date, not UTC', async () => {
    vi.useFakeTimers()
    // 00:30 local on the 28th: a UTC slice would key to the 27th (off-by-one).
    vi.setSystemTime(new Date(2026, 9, 28, 0, 30))

    const view = render(
      <DataProvider>
        <Cardio />
      </DataProvider>,
    )

    fireEvent.click(view.getByRole('button', { name: 'Salva sessione libera' }))
    vi.useRealTimers()
    await waitFor(async () => {
      const logs = await db.cardioLogs.toArray()
      expect(logs).toHaveLength(1)
      expect(logs[0].date).toBe('2026-10-28')
    })
  })
})