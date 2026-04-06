import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransportModal } from './TransportModal'

describe('TransportModal', () => {
  const mockDetail = {
    distance: '约45公里',
    duration: '约60分钟',
    fare: '₩9,500',
    startName: '仁川国际机场',
    endName: '麻浦格莱德酒店',
    steps: [
      {
        mode: 'walk' as const,
        from: '仁川国际机场T1/T2',
        to: '机场铁路入口',
        duration: '约5分钟',
        distance: '约300米',
        instruction: '跟随机场铁路 (AREX) 指示牌前往地下1层乘车口'
      },
      {
        mode: 'train' as const,
        line: '机场铁路 (AREX) 直达列车',
        from: '仁川国际机场',
        to: '孔德站',
        duration: '约50分钟',
        distance: '约45公里',
        instruction: '乘坐机场铁路直达列车，无需换乘，孔德站下车'
      }
    ]
  }

  it('returns null when not open', () => {
    const { container } = render(
      <TransportModal open={false} onClose={vi.fn()} detail={mockDetail} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when detail is null', () => {
    const { container } = render(
      <TransportModal open={true} onClose={vi.fn()} detail={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders transit detail when open', () => {
    render(<TransportModal open={true} onClose={vi.fn()} detail={mockDetail} />)
    expect(screen.getByText('交通详情')).toBeInTheDocument()
    expect(screen.getByText('约45公里')).toBeInTheDocument()
    expect(screen.getByText('约60分钟')).toBeInTheDocument()
    expect(screen.getByText('₩9,500')).toBeInTheDocument()
    expect(screen.getByText('仁川国际机场')).toBeInTheDocument()
    expect(screen.getByText('麻浦格莱德酒店')).toBeInTheDocument()
  })

  it('renders each step with mode icon and instruction', () => {
    render(<TransportModal open={true} onClose={vi.fn()} detail={mockDetail} />)
    expect(screen.getByText('步行')).toBeInTheDocument()
    expect(screen.getByText('火车/铁路')).toBeInTheDocument()
    expect(
      screen.getByText('跟随机场铁路 (AREX) 指示牌前往地下1层乘车口')
    ).toBeInTheDocument()
    expect(screen.getByText(/· 机场铁路 \(AREX\) 直达列车/)).toBeInTheDocument()
  })

  it('calls onClose when clicking overlay', () => {
    const handleClose = vi.fn()
    render(<TransportModal open={true} onClose={handleClose} detail={mockDetail} />)
    const overlay = screen.getByText('交通详情').closest('.fixed.inset-0')
    expect(overlay).toBeTruthy()
    fireEvent.click(overlay!)
    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking close button in header', () => {
    const handleClose = vi.fn()
    render(<TransportModal open={true} onClose={handleClose} detail={mockDetail} />)
    const closeBtn = screen.getByLabelText('关闭')
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking footer close button', () => {
    const handleClose = vi.fn()
    render(<TransportModal open={true} onClose={handleClose} detail={mockDetail} />)
    const footerClose = screen.getByText('关闭')
    fireEvent.click(footerClose)
    expect(handleClose).toHaveBeenCalled()
  })

  it('does not call onClose when clicking modal content', () => {
    const handleClose = vi.fn()
    render(<TransportModal open={true} onClose={handleClose} detail={mockDetail} />)
    const content = screen.getByText('仁川国际机场').closest('div')
    expect(content).toBeTruthy()
    fireEvent.click(content!)
    expect(handleClose).not.toHaveBeenCalled()
  })
})
