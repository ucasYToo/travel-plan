import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LocationDetailModal } from './LocationDetailModal'
import type { ItineraryData } from '../types'

const mockData: ItineraryData = {
  metadata: { title: '测试行程', subtitle: '测试酒店 · 3日' },
  locations: {
    hotel1: {
      id: 'hotel1',
      name: '测试酒店',
      type: 'hotel_group',
      lat: 37.5,
      lng: 127.0,
      color: '#3b82f6',
      description: '测试酒店描述',
      address: '서울 테스트구 테스트동 1',
      children: ['spot1']
    },
    spot1: {
      id: 'spot1',
      name: '景点1',
      type: 'spot',
      lat: 37.6,
      lng: 127.1,
      color: '#ef4444',
      description: '测试景点',
      address: '서울 테스트구 테스트동 2',
      parentId: 'hotel1'
    },
    district1: {
      id: 'district1',
      name: '测试商圈',
      type: 'group',
      lat: 37.55,
      lng: 127.05,
      color: '#8b5cf6',
      description: '测试商圈描述',
      address: '서울 테스트구 테스트동 3',
      children: ['spot1']
    }
  },
  days: [
    {
      day: 1,
      date: '2026-04-29',
      title: '抵达',
      note: '抵达目的地',
      baseHotelId: 'hotel1',
      path: [
        { locationId: 'spot1', label: '机场' },
        { locationId: 'hotel1', label: '机场快线', isHotel: true, notes: [{ category: 'tips', content: '备注1' }] }
      ]
    }
  ]
}

describe('LocationDetailModal', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <LocationDetailModal open={false} onClose={vi.fn()} location={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when location is null', () => {
    const { container } = render(
      <LocationDetailModal open={true} onClose={vi.fn()} location={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders spot location details with description, address and notes', () => {
    render(
      <LocationDetailModal
        open={true}
        onClose={vi.fn()}
        location={mockData.locations.spot1}
        notes={[{ category: 'food', content: '测试吃什么' }]}
      />
    )
    expect(screen.getByText('地点详情')).toBeInTheDocument()
    expect(screen.getByText('景点1')).toBeInTheDocument()
    expect(screen.getByText('描述')).toBeInTheDocument()
    expect(screen.getByText('测试景点')).toBeInTheDocument()
    expect(screen.getByText('地址')).toBeInTheDocument()
    expect(screen.getByText('서울 테스트구 테스트동 2')).toBeInTheDocument()
    expect(screen.getByText('吃什么')).toBeInTheDocument()
    expect(screen.getByText('测试吃什么')).toBeInTheDocument()
    expect(screen.getByText('复制')).toBeInTheDocument()
  })

  it('calls onClose when clicking overlay', () => {
    const handleClose = vi.fn()
    render(
      <LocationDetailModal open={true} onClose={handleClose} location={mockData.locations.spot1} />
    )
    const overlay = screen.getByText('地点详情').closest('.fixed.inset-0')
    expect(overlay).toBeTruthy()
    fireEvent.click(overlay!)
    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking header close button', () => {
    const handleClose = vi.fn()
    render(
      <LocationDetailModal open={true} onClose={handleClose} location={mockData.locations.spot1} />
    )
    const closeBtn = screen.getByLabelText('关闭')
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking footer close button', () => {
    const handleClose = vi.fn()
    render(
      <LocationDetailModal open={true} onClose={handleClose} location={mockData.locations.spot1} />
    )
    const footerButtons = screen.getAllByText('关闭')
    fireEvent.click(footerButtons[footerButtons.length - 1])
    expect(handleClose).toHaveBeenCalled()
  })

  it('does not call onClose when clicking modal content', () => {
    const handleClose = vi.fn()
    render(
      <LocationDetailModal open={true} onClose={handleClose} location={mockData.locations.spot1} />
    )
    const content = screen.getByText('测试景点').closest('div')
    expect(content).toBeTruthy()
    fireEvent.click(content!)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('renders group children spots for district', () => {
    render(
      <LocationDetailModal
        open={true}
        onClose={vi.fn()}
        location={mockData.locations.district1}
        data={mockData}
        dayIndex={0}
      />
    )
    expect(screen.getByText('商圈地点')).toBeInTheDocument()
    expect(screen.getByText('景点1')).toBeInTheDocument()
  })

  it('renders hotel group children spots', () => {
    render(
      <LocationDetailModal
        open={true}
        onClose={vi.fn()}
        location={mockData.locations.hotel1}
        data={mockData}
        dayIndex={0}
      />
    )
    expect(screen.getByText('周边地点')).toBeInTheDocument()
    expect(screen.getByText('景点1')).toBeInTheDocument()
  })

  it('copies address to clipboard when copy button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText
      }
    })
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <LocationDetailModal open={true} onClose={vi.fn()} location={mockData.locations.spot1} />
    )
    fireEvent.click(screen.getByText('复制'))
    expect(writeText).toHaveBeenCalledWith('서울 테스트구 테스트동 2')

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('地址已复制！')
    })

    alertSpy.mockRestore()
  })
})
