import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ItineraryData } from '../types'
import { MapController } from './MapController'

const mocks = vi.hoisted(() => ({
  flyTo: vi.fn(),
  fitBounds: vi.fn(),
  getZoom: vi.fn(() => 12),
  on: vi.fn(),
  off: vi.fn(),
  removeControl: vi.fn(),
  extend: vi.fn(),
  addTo: vi.fn(),
}))

vi.mock('react-leaflet', () => ({
  useMap: () => ({
    flyTo: mocks.flyTo,
    fitBounds: mocks.fitBounds,
    getZoom: mocks.getZoom,
    on: mocks.on,
    off: mocks.off,
    removeControl: mocks.removeControl,
  }),
}))

vi.mock('leaflet', () => ({
  default: {
    control: { zoom: () => ({ addTo: mocks.addTo }) },
    latLngBounds: () => ({ extend: mocks.extend }),
  },
}))

const location = {
  id: 'hotel',
  name: 'Hotel',
  lat: 51.52,
  lng: -0.12,
  color: '#2563eb',
  type: 'hotel_group' as const,
  children: [],
}

function createData(mapCenter?: { lat: number; lng: number }): ItineraryData {
  return {
    metadata: { title: 'Trip', subtitle: 'Test', mapCenter, mapZoom: 11 },
    locations: { hotel: location },
    days: [],
  }
}

describe('MapController overview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the configured default viewport instead of fitting remote locations', () => {
    const center: [number, number] = [51.5145, -0.124]
    render(
      <MapController
        activeDay={null}
        resetView={0}
        data={createData({ lat: center[0], lng: center[1] })}
        defaultCenter={center}
        defaultZoom={11}
      />,
    )

    expect(mocks.fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ maxZoom: 11, duration: 1 }),
    )
    expect(mocks.extend).not.toHaveBeenCalled()
  })

  it('fits all locations when no default center is configured', () => {
    render(
      <MapController
        activeDay={null}
        resetView={0}
        data={createData()}
        defaultCenter={[51.52, -0.12]}
        defaultZoom={11}
      />,
    )

    expect(mocks.extend).toHaveBeenCalledWith([location.lat, location.lng])
    expect(mocks.fitBounds).toHaveBeenCalled()
    expect(mocks.flyTo).not.toHaveBeenCalled()
  })
})
