import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, within, screen } from '@testing-library/react'
import { MapControls } from './MapControls'

describe('MapControls', () => {
  const defaultProps = {
    currentCity: 'seoul',
    settings: { showLocationNames: true, showTransit: false },
    dayOptions: ['Day1', 'Day2', 'Day3'],
    activeDay: 0,
    onCityChange: vi.fn(),
    onClearRoute: vi.fn(),
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
    const mobileTop = container.querySelector('.sm\\:hidden.flex.gap-2')
    expect(mobileTop).toBeTruthy()
  })

  it('renders mobile bottom toolbar', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const bottomBar = container.querySelector('.fixed.bottom-0')
    expect(bottomBar).toBeTruthy()
    expect(within(bottomBar as HTMLElement).getByText('清除路线')).toBeInTheDocument()
  })

  it('renders mobile view toggle', () => {
    render(<MapControls {...defaultProps} />)
    expect(screen.getByText('全景')).toBeInTheDocument()
    expect(screen.getByText('路线')).toBeInTheDocument()
  })

  it('highlights full view when viewMode is full', () => {
    render(<MapControls {...defaultProps} viewMode="full" />)
    const fullViewBtn = screen.getByText('全景')
    expect(fullViewBtn.className).toContain('bg-[#A8E6CF]')
  })

  it('calls onClearRoute when clear route button is clicked', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const bottomBar = container.querySelector('.fixed.bottom-0')
    const clearBtn = within(bottomBar as HTMLElement).getByText('清除路线')
    fireEvent.click(clearBtn)
    expect(defaultProps.onClearRoute).toHaveBeenCalled()
  })

  it('calls onResetView when reset view button is clicked', () => {
    render(<MapControls {...defaultProps} />)
    const resetBtn = screen.getByText('全景')
    fireEvent.click(resetBtn)
    expect(defaultProps.onResetView).toHaveBeenCalled()
  })

  it('calls onCityChange when bottom bar city selector changes', () => {
    const { container } = render(<MapControls {...defaultProps} />)
    const bottomBar = container.querySelector('.fixed.bottom-0')
    const citySelect = within(bottomBar as HTMLElement).getByDisplayValue('🇰🇷 首尔')
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
