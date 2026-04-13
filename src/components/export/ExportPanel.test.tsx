import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ExportPanel } from './ExportPanel'

describe('ExportPanel', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
    isExporting: false,
    dayCount: 5,
  }

  it('renders four export options', () => {
    const { getByText } = render(<ExportPanel {...defaultProps} />)
    expect(getByText('全景横图 (2560×1440)')).toBeInTheDocument()
    expect(getByText('当天横图 (2560×1440)')).toBeInTheDocument()
    expect(getByText('当天竖图 (1080px 宽)')).toBeInTheDocument()
    expect(getByText('完整竖图 (1080px 宽)')).toBeInTheDocument()
  })

  it('calls onExport with mode and empty days for panorama', () => {
    const { getByText } = render(<ExportPanel {...defaultProps} />)
    fireEvent.click(getByText('全景横图 (2560×1440)'))
    expect(defaultProps.onExport).toHaveBeenCalledWith('panorama', [])
  })

  it('disables day options when no day selected', () => {
    const { getByText } = render(<ExportPanel {...defaultProps} />)
    const dayHorizontal = getByText('当天横图 (2560×1440)').closest('button')
    const dayVertical = getByText('当天竖图 (1080px 宽)').closest('button')
    expect(dayHorizontal).toBeDisabled()
    expect(dayVertical).toBeDisabled()
  })

  it('enables day options after selecting a day', () => {
    const { getByText } = render(<ExportPanel {...defaultProps} />)
    fireEvent.click(getByText('Day1'))
    const dayHorizontal = getByText('当天横图 (2560×1440)').closest('button')
    expect(dayHorizontal).not.toBeDisabled()
    fireEvent.click(getByText('当天横图 (2560×1440)'))
    expect(defaultProps.onExport).toHaveBeenCalledWith('day-horizontal', [0])
  })

  it('supports multi-day selection', () => {
    const { getByText } = render(<ExportPanel {...defaultProps} />)
    fireEvent.click(getByText('Day1'))
    fireEvent.click(getByText('Day3'))
    fireEvent.click(getByText('当天竖图 (1080px 宽)'))
    expect(defaultProps.onExport).toHaveBeenCalledWith('day-vertical', [0, 2])
  })

  it('calls onClose when clicking cancel', () => {
    const { getByText } = render(<ExportPanel {...defaultProps} />)
    fireEvent.click(getByText('取消'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking overlay', () => {
    const { container } = render(<ExportPanel {...defaultProps} />)
    const overlay = container.firstChild
    fireEvent.click(overlay as Element)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('returns null when not open', () => {
    const { container } = render(<ExportPanel {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })
})
