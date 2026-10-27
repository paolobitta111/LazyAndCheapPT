import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import WorkoutPlayer from './WorkoutPlayer'
import { DataProvider, db } from '../data/db'
import { dateKey } from '../services/planning.service'
import type { TrainingPlan } from '../models/entities'

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()))
})

describe('WorkoutPlayer', () => {
  function PlayerAtToday() {
    return (
      <DataProvider>
        <MemoryRouter initialEntries={['/workout/p1']}>
          <Routes>
            <Route path="/workout/:planId" element={<WorkoutPlayer />} />
          </Routes>
        </MemoryRouter>
      </DataProvider>
    )
  }

  async function seed() {
    const today = dateKey(new Date())
    const plan: TrainingPlan = {
      id: 'p1',
      name: 'Corsa',
      description: '',
      exercises: [],
      version: 1,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.trainingPlans.put(plan)
    await db.plannedSessions.put({
      id: 's1',
      planId: 'p1',
      date: today,
      status: 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return today
  }

  it('starts a session for today with a local date key', async () => {
    const today = await seed()
    const { getByText } = render(<PlayerAtToday />)

    await waitFor(() => expect(getByText('Corsa')).toBeTruthy())
    const logs = await db.workoutLogs.toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0].date).toBe(today)
    expect(logs[0].plannedSessionId).toBe('s1')
  })

  it('reuses the existing log on re-entry instead of duplicating it', async () => {
    await seed()
    const first = render(<PlayerAtToday />)
    await waitFor(() => expect(first.getByText('Corsa')).toBeTruthy())
    first.unmount()

    const second = render(<PlayerAtToday />)
    await waitFor(() => expect(second.getByText('Corsa')).toBeTruthy(), { timeout: 3000 })

    const logs = await db.workoutLogs.toArray()
    expect(logs).toHaveLength(1)
  })
})