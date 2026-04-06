import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LocationDetailPanel } from './LocationDetailPanel'
import type { LocationOrGroup } from '../types'

const mockSpot: LocationOrGroup = {
  id: 'spot1',
  name: '景点1',
  type: 'spot',
  lat: 37.6,
  lng: 127.1,
  color: '#ef4444',
  description: '测试景点描述',
  address: '서울 테스트구 테스트동 2',
  parentId: 'district1'
}

const mockGroup: LocationOrGroup = {
  id: 'district1',
  name: '测试商圈',
  type: 'group',
  lat: 37.55,
  lng: 127.05,
  color: '#8b5cf6',
  description: '测试商圈描述',
  children: []
}

describe('LocationDetailPanel', () => {
  it('renders placeholder when location is null', () => {
    render(<LocationDetailPanel location={null} />)
    expect(screen.getByText(/点击地图或行程查看详情/)).toBeInTheDocument()
  })

  it('renders location name and type label for spot', () => {
    render(<LocationDetailPanel location={mockSpot} />)
    expect(screen.getByText('景点1')).toBeInTheDocument()
    expect(screen.getByText('景点')).toBeInTheDocument()
  })

  it('renders location name and type label for group', () => {
    render(<LocationDetailPanel location={mockGroup} />)
    expect(screen.getByText('测试商圈')).toBeInTheDocument()
    expect(screen.getByText('商圈 / 景点组')).toBeInTheDocument()
  })

  it('renders description and address in content', () => {
    render(<LocationDetailPanel location={mockSpot} />)
    expect(screen.getByText('测试景点描述')).toBeInTheDocument()
    expect(screen.getByText('서울 테스트구 테스트동 2')).toBeInTheDocument()
    expect(screen.getByText('复制')).toBeInTheDocument()
  })
})
