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
    onRouteView: vi.fn(),
    onExportClick: vi.fn(),
    isExporting: false,
  }

  it('renders desktop controls hidden on mobile', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} />)
    expect(getByTestId('desktop-controls')).toBeTruthy()
  })

  it('renders mobile top controls', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} />)
    expect(getByTestId('mobile-top-controls')).toBeTruthy()
  })

  it('renders mobile view toggle', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} />)
    const mobileTop = getByTestId('mobile-top-controls')
    expect(within(mobileTop as HTMLElement).getByText('全景')).toBeInTheDocument()
    expect(within(mobileTop as HTMLElement).getByText('线路')).toBeInTheDocument()
  })

  it('highlights full view when viewMode is full', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} viewMode="full" />)
    const mobileTop = getByTestId('mobile-top-controls')
    const fullViewBtn = within(mobileTop as HTMLElement).getByText('全景')
    expect(fullViewBtn).toHaveAttribute('data-active', 'true')
  })

  it('calls onResetView when reset view button is clicked', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} />)
    const mobileTop = getByTestId('mobile-top-controls')
    const resetBtn = within(mobileTop as HTMLElement).getByText('全景')
    fireEvent.click(resetBtn)
    expect(defaultProps.onResetView).toHaveBeenCalled()
  })

  it('calls onCityChange when mobile top city selector changes', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} />)
    const mobileTop = getByTestId('mobile-top-controls')
    const citySelect = within(mobileTop as HTMLElement).getByDisplayValue('🇰🇷 首尔')
    fireEvent.change(citySelect, { target: { value: 'seoul' } })
    expect(defaultProps.onCityChange).toHaveBeenCalledWith('seoul')
  })

  it('calls onSettingsChange when desktop location names checkbox toggles', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} />)
    const desktop = getByTestId('desktop-controls')
    const checkbox = within(desktop as HTMLElement).getByLabelText('地点名')
    fireEvent.click(checkbox)
    expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ showLocationNames: false, showTransit: false })
    )
  })

  it('calls onSettingsChange when desktop transit checkbox toggles', () => {
    const { getByTestId } = render(<MapControls {...defaultProps} />)
    const desktop = getByTestId('desktop-controls')
    const checkbox = within(desktop as HTMLElement).getByLabelText('交通')
    fireEvent.click(checkbox)
    expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ showLocationNames: true, showTransit: true })
    )
  })

  it('renders export button and opens export panel', () => {
    const { getByTestId, getByText } = render(<MapControls {...defaultProps} />)
    const desktop = getByTestId('desktop-controls')
    const exportBtn = within(desktop as HTMLElement).getByLabelText('导出')
    expect(exportBtn).toBeTruthy()

    fireEvent.click(exportBtn)
    expect(getByText('导出图片')).toBeInTheDocument()
  })

  it('calls onExportClick when export panel option clicked', () => {
    const { getByTestId, getByText } = render(<MapControls {...defaultProps} />)
    const desktop = getByTestId('desktop-controls')
    const exportBtn = within(desktop as HTMLElement).getByLabelText('导出')
    fireEvent.click(exportBtn)

    const panoramaBtn = getByText('全景横图 (2560×1440)')
    fireEvent.click(panoramaBtn)
    expect(defaultProps.onExportClick).toHaveBeenCalledWith('panorama', [])
  })

  it('disables day export options when no day is selected in panel', () => {
    const { getByTestId, getByText } = render(<MapControls {...defaultProps} />)
    const desktop = getByTestId('desktop-controls')
    const exportBtn = within(desktop as HTMLElement).getByLabelText('导出')
    fireEvent.click(exportBtn)

    const dayHorizontal = getByText('当天横图 (2560×1440)').closest('button')
    const dayVertical = getByText('当天竖图 (1080px 宽)').closest('button')
    expect(dayHorizontal).toBeDisabled()
    expect(dayVertical).toBeDisabled()
  })
})
