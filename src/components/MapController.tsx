import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ItineraryData } from '../types'

interface MapControllerProps {
  activeDay: number | null
  resetView: number
  data: ItineraryData
  defaultCenter: [number, number]
  defaultZoom: number
  onZoomChange?: (zoom: number) => void
}

export function MapController({ activeDay, resetView, data, defaultCenter, defaultZoom, onZoomChange }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    const zoomControl = L.control.zoom({ position: 'bottomright' })
    zoomControl.addTo(map)
    return () => {
      map.removeControl(zoomControl)
    }
  }, [map])

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange?.(map.getZoom())
    }
    map.on('zoomend', handleZoom)
    handleZoom()
    return () => {
      map.off('zoomend', handleZoom)
    }
  }, [map, onZoomChange])

  useEffect(() => {
    if (activeDay !== null) {
      const day = data.days[activeDay]
      if (day && day.path.length > 0) {
        const bounds = L.latLngBounds([])
        let hasValidPoint = false
        for (const point of day.path) {
          const loc = data.locations[point.locationId]
          if (loc) {
            bounds.extend([loc.lat, loc.lng])
            hasValidPoint = true
          }
        }
        if (hasValidPoint) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, duration: 1 })
        }
      }
    } else {
      const bounds = L.latLngBounds([])
      let hasValidPoint = false
      for (const loc of Object.values(data.locations)) {
        bounds.extend([loc.lat, loc.lng])
        hasValidPoint = true
      }
      if (hasValidPoint) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, duration: 1 })
      } else {
        map.flyTo(defaultCenter, defaultZoom, { duration: 1 })
      }
    }
  }, [map, activeDay, resetView, data, defaultCenter, defaultZoom])

  return null
}
