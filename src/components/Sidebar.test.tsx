import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Sidebar } from './Sidebar'
import type { ItineraryData } from '../types'

const mockData: ItineraryData = {
  metadata: {
    title: '测试行程',
    subtitle: '测试酒店 · 3日'
  },
  locations: {
    hotel1: {
      id: 'hotel1',
      name: '测试酒店',
      type: 'hotel_group',
      lat: 37.5,
      lng: 127.0,
      color: '#3b82f6',
      description: '测试酒店描述',
      children: []
    },
    district1: {
      id: 'district1',
      name: '测试商圈',
      type: 'group',
      lat: 37.55,
      lng: 127.05,
      color: '#8b5cf6',
      description: '测试商圈描述',
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
      parentId: 'district1'
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
        { locationId: 'hotel1', label: '机场快线', isHotel: true }
      ]
    },
    {
      day: 2,
      date: '2026-04-30',
      title: '游玩',
      note: '市区游览',
      baseHotelId: 'hotel1',
      path: [
        { locationId: 'hotel1', label: '起点', isHotel: true },
        { locationId: 'spot1', label: '地铁 · 10分钟', notes: [{ category: 'tips', content: '测试备注内容' }] },
        { locationId: 'hotel1', label: '返回酒店', isHotel: true }
      ]
    },
    {
      day: 3,
      date: '2026-05-01',
      title: '返程',
      note: '返回家中',
      baseHotelId: 'hotel1',
      path: [
        { locationId: 'hotel1', label: '起点', isHotel: true },
        { locationId: 'spot1', label: '机场快线' }
      ]
    }
  ]
}

describe('Sidebar', () => {
  it('renders header with metadata', () => {
    render(
      <Sidebar
        data={mockData}
        activeDay={null}
        onSelectDay={() => {}}
        isOpen={true}
      />
    )
    expect(screen.getByText('测试行程')).toBeInTheDocument()
    expect(screen.getByText('测试酒店 · 3日')).toBeInTheDocument()
  })

  it('renders hotel cards', () => {
    render(
      <Sidebar
        data={mockData}
        activeDay={null}
        onSelectDay={() => {}}
        isOpen={true}
      />
    )
    // Hotel name appears in the hotel card section and in path segments
    const hotelElements = screen.getAllByText('测试酒店')
    expect(hotelElements.length).toBeGreaterThanOrEqual(1)
    // Check for hotel description
    expect(screen.getByText('测试酒店描述')).toBeInTheDocument()
  })

  it('renders all day cards', () => {
    render(
      <Sidebar
        data={mockData}
        activeDay={null}
        onSelectDay={() => {}}
        isOpen={true}
      />
    )
    expect(screen.getByText('4月29日 抵达')).toBeInTheDocument()
    expect(screen.getByText('4月30日 游玩')).toBeInTheDocument()
    expect(screen.getByText('5月1日 返程')).toBeInTheDocument()
  })

  it('calls onSelectDay with the correct index when a card is clicked', () => {
    const handleSelect = vi.fn()
    render(
      <Sidebar
        data={mockData}
        activeDay={null}
        onSelectDay={handleSelect}
        isOpen={true}
      />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])
    expect(handleSelect).toHaveBeenCalledWith(1)
  })

  it('highlights the active day card', () => {
    render(
      <Sidebar
        data={mockData}
        activeDay={1}
        onSelectDay={() => {}}
        isOpen={true}
      />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[1].className).toContain('border-[#A8E6CF]')
    expect(buttons[1].className).toContain('bg-[#DCFAED]')
  })

  it('renders route segments for each day', () => {
    render(
      <Sidebar
        data={mockData}
        activeDay={null}
        onSelectDay={() => {}}
        isOpen={true}
      />
    )
    // Day 1 should have route segments
    // "景点1" appears multiple times, check at least one exists
    const spotElements = screen.getAllByText('景点1')
    expect(spotElements.length).toBeGreaterThanOrEqual(1)
  })

  it('calls onShowLocationDetail when a spot row is clicked', () => {
    const handleDetail = vi.fn()
    render(
      <Sidebar
        data={mockData}
        activeDay={1}
        onSelectDay={() => {}}
        isOpen={true}
        onShowLocationDetail={handleDetail}
      />
    )
    const dayButtons = screen.getAllByRole('button')
    const day2Button = dayButtons[1]
    const spotRow = within(day2Button).getByText('景点1').parentElement
    expect(spotRow).toBeTruthy()
    fireEvent.click(spotRow!)
    expect(handleDetail).toHaveBeenCalled()
  })

  it('calls onShowLocationDetail when a district header is clicked', () => {
    const handleDetail = vi.fn()
    render(
      <Sidebar
        data={mockData}
        activeDay={1}
        onSelectDay={() => {}}
        isOpen={true}
        onShowLocationDetail={handleDetail}
      />
    )
    const dayButtons = screen.getAllByRole('button')
    const day2Button = dayButtons[1]
    const districtHeader = within(day2Button).getByText('测试商圈').parentElement
    expect(districtHeader).toBeTruthy()
    fireEvent.click(districtHeader!)
    expect(handleDetail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'district1' }),
      undefined,
      1
    )
  })

  it('calls onShowLocationDetail when a hotel row is clicked', () => {
    const handleDetail = vi.fn()
    render(
      <Sidebar
        data={mockData}
        activeDay={1}
        onSelectDay={() => {}}
        isOpen={true}
        onShowLocationDetail={handleDetail}
      />
    )
    const dayButtons = screen.getAllByRole('button')
    const day2Button = dayButtons[1]
    const hotelRows = within(day2Button).getAllByText('测试酒店')
    expect(hotelRows.length).toBeGreaterThanOrEqual(1)
    fireEvent.click(hotelRows[0].parentElement!)
    expect(handleDetail).toHaveBeenCalled()
  })

  it('passes notes to onShowLocationDetail when spot has notes', () => {
    const handleDetail = vi.fn()
    render(
      <Sidebar
        data={mockData}
        activeDay={1}
        onSelectDay={() => {}}
        isOpen={true}
        onShowLocationDetail={handleDetail}
      />
    )
    const dayButtons = screen.getAllByRole('button')
    const day2Button = dayButtons[1]
    const spotRow = within(day2Button).getByText('景点1').parentElement
    fireEvent.click(spotRow!)
    expect(handleDetail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'spot1', name: '景点1' }),
      [{ category: 'tips', content: '测试备注内容' }],
      1
    )
  })
})
