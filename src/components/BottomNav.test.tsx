import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('shows five glass tabs and a droplet only on the active one', () => {
    const onNavigate = vi.fn()
    const { container } = render(<BottomNav activeTab="/" onNavigate={onNavigate} />)
    const buttons = [...container.querySelectorAll('button')]

    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'Oggi',
      'Schede',
      'Calendario',
      'Storico',
      'Impostazioni',
    ])

    const oggi = buttons[0]
    expect(oggi).toHaveClass('active')
    expect(oggi.querySelector('.glass-pill')).not.toBeNull()
    expect(buttons[1].querySelector('.glass-pill')).toBeNull()
    expect(container.querySelector('nav')).toHaveClass('glass-bar')
    expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
    expect(buttons.some((button) => button.textContent?.includes('LLM'))).toBe(false)

    fireEvent.click(buttons[1])
    expect(onNavigate).toHaveBeenCalledWith('/schede')
  })
})
