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
  viewportPadding?: MapViewportPadding
}

export interface MapViewportPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export function MapController({ activeDay, resetView, data, defaultCenter, defaultZoom, onZoomChange, viewportPadding }: MapControllerProps) {
  const map = useMap()

  const fitPadding = viewportPadding
    ? {
        paddingTopLeft: [viewportPadding.left, viewportPadding.top] as [number, number],
        paddingBottomRight: [viewportPadding.right, viewportPadding.bottom] as [number, number],
      }
    : { padding: [40, 40] as [number, number] }

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
          map.fitBounds(bounds, { ...fitPadding, maxZoom: 16, duration: 1 })
        }
      }
    } else if (data.metadata.mapCenter) {
      // Respect an explicitly configured overview. This keeps remote day trips
      // and airports from shrinking the main city into an unreadable cluster.
      // A single-point bounds also applies the panel/bottom-sheet padding.
      const overviewBounds = L.latLngBounds([defaultCenter])
      map.fitBounds(overviewBounds, {
        ...fitPadding,
        maxZoom: defaultZoom,
        duration: 1,
      })
    } else {
      const bounds = L.latLngBounds([])
      let hasValidPoint = false
      for (const loc of Object.values(data.locations)) {
        bounds.extend([loc.lat, loc.lng])
        hasValidPoint = true
      }
      if (hasValidPoint) {
        map.fitBounds(bounds, { ...fitPadding, maxZoom: 14, duration: 1 })
      } else {
        map.flyTo(defaultCenter, defaultZoom, { duration: 1 })
      }
    }
  }, [map, activeDay, resetView, data, defaultCenter, defaultZoom, viewportPadding?.top, viewportPadding?.right, viewportPadding?.bottom, viewportPadding?.left])

  return null
}
