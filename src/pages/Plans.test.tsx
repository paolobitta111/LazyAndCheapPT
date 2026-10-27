import { fireEvent, render, waitFor, within } from '@testing-library/react'
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

async function createCorsa(view: ReturnType<typeof renderPlans>) {
  fireEvent.click(view.getByRole('button', { name: 'Nuova scheda' }))
  const dialog = view.getByRole('dialog', { name: 'Nuova scheda' })
  expect(within(dialog).getByRole('button', { name: 'Salva' }).disabled).toBe(true)
  fireEvent.change(within(dialog).getByLabelText('Nome'), { target: { value: 'Corsa' } })
  expect(within(dialog).getByRole('button', { name: 'Salva' }).disabled).toBe(false)
  fireEvent.click(within(dialog).getByRole('button', { name: 'Martedì' }))
  fireEvent.click(within(dialog).getByRole('button', { name: '+ Aggiungi data' }))
  fireEvent.change(within(dialog).getByLabelText('Nuova data') as HTMLInputElement, { target: { value: '2026-11-03' } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Aggiungi' }))
  fireEvent.click(within(dialog).getByRole('button', { name: 'Esercizio 1' }))
  fireEvent.change(within(dialog).getByLabelText('Esercizio 1 nome'), { target: { value: 'Corsa' } })
  fireEvent.click(within(dialog).getByRole('button', { name: '‹ Esercizi' }))
  fireEvent.click(within(dialog).getByRole('button', { name: 'Salva' }))
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()))
})

describe('Plans', () => {
  it('creates a scheda via the sheet', async () => {
    const view = renderPlans()
    await waitFor(() => expect(view.getByRole('button', { name: 'Nuova scheda' })).toBeTruthy())

    await createCorsa(view)

    await waitFor(() => expect(view.getByText('Corsa')).toBeTruthy())
    expect(view.getByText('2026-11-03')).toBeTruthy()
    expect(view.getByText('1 esercizio')).toBeTruthy()
    expect(view.getByText('M')).toBeTruthy()
  })

  it('edits in place without duplicating the scheda', async () => {
    const view = renderPlans()
    await waitFor(() => expect(view.getByRole('button', { name: 'Nuova scheda' })).toBeTruthy())

    await createCorsa(view)
    await waitFor(() => expect(view.getByText('Corsa')).toBeTruthy())

    fireEvent.click(view.getByRole('button', { name: 'Modifica' }))
    const dialog = view.getByRole('dialog', { name: 'Modifica scheda' })
    const name = within(dialog).getByLabelText('Nome') as HTMLInputElement
    expect(name.value).toBe('Corsa')
    fireEvent.change(name, { target: { value: 'Corsa veloce' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salva' }))

    await waitFor(() => expect(view.getByText('Corsa veloce')).toBeTruthy())
    expect(view.queryByText(/^Corsa$/)).toBeNull()
    expect(view.getAllByText('M')).toHaveLength(1)
    expect(view.getByText('2026-11-03')).toBeTruthy()
  })
})
