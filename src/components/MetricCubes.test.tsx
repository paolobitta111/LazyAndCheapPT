import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MetricCubes } from './MetricCubes'

describe('MetricCubes', () => {
  it('renders weather and health values', () => {
    const { container, getByText } = render(
      <MetricCubes
        weather={{ tempC: 14, wind: 8 }}
        health={{ sleep: 7, restingHr: 52, steps: 3240 }}
        onEditHealth={() => undefined}
      />,
    )
    expect(getByText('14°')).toBeTruthy()
    expect(getByText('8')).toBeTruthy()
    expect(getByText('52')).toBeTruthy()
    expect(getByText('3.240')).toBeTruthy()
    expect(container.textContent).toContain('7h')
  })

  it('shows em dashes when weather is unavailable', () => {
    const { getAllByText } = render(
      <MetricCubes
        weather={{ tempC: null, wind: null }}
        health={{ sleep: 7, restingHr: 52, steps: 3240 }}
        onEditHealth={() => undefined}
      />,
    )
    expect(getAllByText('—')).toHaveLength(2)
  })

  it('opens the health editor from the health cube', () => {
    const onEditHealth = vi.fn()
    const { getByRole } = render(
      <MetricCubes weather={{ tempC: null, wind: null }} health={{}} onEditHealth={onEditHealth} />,
    )
    fireEvent.click(getByRole('button', { name: 'Modifica salute' }))
    expect(onEditHealth).toHaveBeenCalled()
  })
})