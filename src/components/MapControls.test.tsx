import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { MapControls } from './MapControls'

describe('MapControls', () => {
  const defaultProps = {
    currentCity: 'seoul',
    settings: { showLocationNames: true, showTransit: false },
    dayOptions: ['Day1', 'Day2', 'Day3'],
    activeDay: 0,
    onCityChange: vi.fn(),
    onResetView: vi.fn(),
    onSelectDay: vi.fn(),
    onSettingsChange: vi.fn(),
    viewMode: 'route' as const,
    onRouteView: vi.fn()
  }

  it('renders desktop controls hidden on mobile', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const desktop = container.querySelector('.hidden.sm\\:flex')
    expect(desktop).toBeTruthy()
  })

  it('renders mobile top controls', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const mobileTop = container.querySelector('.sm\\:hidden.flex.flex-col.gap-2')
    expect(mobileTop).toBeTruthy()
  })

  it('renders mobile view toggle', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const mobileTop = container.querySelector('.sm\\:hidden.flex.flex-col.gap-2')
    expect(within(mobileTop as HTMLElement).getByText('全景')).toBeInTheDocument()
    expect(within(mobileTop as HTMLElement).getByText('线路')).toBeInTheDocument()
  })

  it('highlights full view when viewMode is full', () => {
    const { container } = render(<MapControls {...defaultProps} viewMode="full" />)
    const mobileTop = container.querySelector('.sm\\:hidden.flex.flex-col.gap-2')
    const fullViewBtn = within(mobileTop as HTMLElement).getByText('全景')
    expect(fullViewBtn.className).toContain('bg-[var(--bud-green)]')
  })

  it('calls onResetView when reset view button is clicked', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const mobileTop = container.querySelector('.sm\\:hidden.flex.flex-col.gap-2')
    const resetBtn = within(mobileTop as HTMLElement).getByText('全景')
    fireEvent.click(resetBtn)
    expect(defaultProps.onResetView).toHaveBeenCalled()
  })

  it('calls onCityChange when mobile top city selector changes', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const mobileTop = container.querySelector('.sm\\:hidden.flex.flex-col.gap-2')
    const citySelect = within(mobileTop as HTMLElement).getByDisplayValue('🇰🇷 首尔')
    fireEvent.change(citySelect, { target: { value: 'seoul' } })
    expect(defaultProps.onCityChange).toHaveBeenCalledWith('seoul')
  })

  it('calls onSettingsChange when desktop location names checkbox toggles', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const desktop = container.querySelector('.hidden.sm\\:flex')
    const checkbox = within(desktop as HTMLElement).getByLabelText('地点名')
    fireEvent.click(checkbox)
    expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ showLocationNames: false, showTransit: false })
    )
  })

  it('calls onSettingsChange when desktop transit checkbox toggles', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const desktop = container.querySelector('.hidden.sm\\:flex')
    const checkbox = within(desktop as HTMLElement).getByLabelText('交通')
    fireEvent.click(checkbox)
    expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ showLocationNames: true, showTransit: true })
    )
  })
})
