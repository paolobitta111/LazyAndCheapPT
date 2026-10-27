import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import Plans from './Plans'
import { DataProvider, db } from '../data/db'

function renderPlans() {
  return render(
    <DataProvider>
      <MemoryRouter>
        <Plans />
      </MemoryRouter>
    </DataProvider>,
  )
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()))
})

describe('Plans', () => {
  it('creates a scheda with weekday and date assignment', async () => {
    const view = renderPlans()
    await waitFor(() => expect(view.getByRole('button', { name: 'Nuova scheda' })).toBeTruthy())

    fireEvent.click(view.getByRole('button', { name: 'Nuova scheda' }))
    fireEvent.change(view.getByLabelText('Nome'), { target: { value: 'Corsa' } })
    fireEvent.click(view.getByRole('button', { name: 'Martedì' }))
    fireEvent.change(view.getByLabelText('Nuova data') as HTMLInputElement, { target: { value: '2026-11-03' } })
    fireEvent.click(view.getByRole('button', { name: 'Aggiungi data' }))
    fireEvent.change(view.getByLabelText('Esercizio 1 nome'), { target: { value: 'Corsa' } })
    fireEvent.click(view.getByRole('button', { name: 'Salva' }))

    await waitFor(() => expect(view.getByText('Corsa')).toBeTruthy())
    expect(view.getByText('2026-11-03')).toBeTruthy()
    expect(view.getByText('1 esercizio')).toBeTruthy()
    expect(view.getByText('M')).toBeTruthy()
  })

  it('edits in place without duplicating the scheda', async () => {
    const view = renderPlans()
    await waitFor(() => expect(view.getByRole('button', { name: 'Nuova scheda' })).toBeTruthy())

    fireEvent.click(view.getByRole('button', { name: 'Nuova scheda' }))
    fireEvent.change(view.getByLabelText('Nome'), { target: { value: 'Corsa' } })
    fireEvent.click(view.getByRole('button', { name: 'Martedì' }))
    fireEvent.change(view.getByLabelText('Nuova data') as HTMLInputElement, { target: { value: '2026-11-03' } })
    fireEvent.click(view.getByRole('button', { name: 'Aggiungi data' }))
    fireEvent.click(view.getByRole('button', { name: 'Salva' }))
    await waitFor(() => expect(view.getByText('Corsa')).toBeTruthy())

    fireEvent.click(view.getByRole('button', { name: 'Modifica' }))
    const name = view.getByLabelText('Nome') as HTMLInputElement
    expect(name.value).toBe('Corsa')
    fireEvent.change(name, { target: { value: 'Corsa veloce' } })
    fireEvent.click(view.getByRole('button', { name: 'Salva' }))

    await waitFor(() => expect(view.getByText('Corsa veloce')).toBeTruthy())
    expect(view.queryByText(/^Corsa$/)).toBeNull()
    expect(view.getAllByText('M')).toHaveLength(1)
    expect(view.getByText('2026-11-03')).toBeTruthy()
  })
})