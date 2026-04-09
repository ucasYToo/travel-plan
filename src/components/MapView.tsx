import { useMemo, useEffect, Fragment } from 'react'
import { MapContainer, Marker, Polyline, useMap } from 'react-leaflet'
import { SmartTileLayer } from './SmartTileLayer'
import L from 'leaflet'
import styles from './MapView.module.css'
import type { ItineraryData, TransitDetail, LocationOrGroup, LocationGroup, Location, NoteItem } from '../types'

interface MapControllerProps {
  activeDay: number | null
  resetView: number
  data: ItineraryData
  defaultCenter: [number, number]
  defaultZoom: number
  onZoomChange?: (zoom: number) => void
}

function MapController({ activeDay, resetView, data, defaultCenter, defaultZoom, onZoomChange }: MapControllerProps) {
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

// Type guard to check if location is a group
function isLocationGroup(loc: LocationOrGroup): loc is LocationGroup {
  return loc.type === 'group' || loc.type === 'hotel_group'
}

function createCustomMarker(location: LocationOrGroup, badge?: string, showName = false): L.DivIcon {
  const isGroup = isLocationGroup(location)
  const isHotelGroup = location.type === 'hotel_group'
  const size = isGroup ? 40 : 24
  const svgColor = location.color

  const paperColor = '#FFF8FA'

  const orderBadge = '';

  // const orderBadge = badge
    // ? `<div style="position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;padding:0 5px;background:#2A2A2A;color:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:2px solid ${paperColor};box-shadow:0 1px 3px rgba(0,0,0,0.12);z-index:10">${badge}</div>`
    // : ''

  const markerBody = isHotelGroup
    ? `<div style="width:40px;height:40px;background:${svgColor};border-radius:50%;border:3px solid ${paperColor};box-shadow:0 3px 10px rgba(244,164,184,0.35);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#fff">住</div>`
    : isGroup
      ? `<div style="width:40px;height:40px;background:${svgColor};border-radius:50%;border:3px solid ${paperColor};box-shadow:0 3px 10px rgba(244,164,184,0.35);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fff">${badge || '●'}</div>`
      : `<div style="width:24px;height:24px;background:${svgColor};border-radius:50%;border:2px solid ${paperColor};box-shadow:0 3px 10px rgba(244,164,184,0.30);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600;">${badge || '•'}</div>`

  const nameLabel = showName
    ? `<div style="margin-top:4px;padding:2px 10px;background:rgba(255,248,250,0.95);border:1px solid #FCE7EF;border-radius:9999px;font-size:10px;font-weight:600;color:#2A2A2A;white-space:nowrap;box-shadow:0 1px 4px rgba(244,164,184,0.10)">${location.name}</div>`
    : ''

  const iconHtml = `
    <div style="display:flex;flex-direction:column;align-items:center" class="marker-wrap">
      <div style="color: ${svgColor}; position:relative; display:inline-block" class="marker-pop">${markerBody}${orderBadge}</div>
      ${nameLabel}
    </div>
  `

  const anchorShift = !isGroup && badge ? 8 : 0
  const labelHeight = showName ? 20 : 0

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size + labelHeight],
    iconAnchor: [size / 2 + anchorShift, size - anchorShift / 2 + labelHeight],
    popupAnchor: [0, -size + anchorShift / 2]
  })
}

function createRouteLabelIcon(text: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="max-width:180px;padding:4px 10px;background:rgba(255,248,250,0.95);border:1px solid #FCE7EF;border-radius:9999px;font-size:11px;font-weight:600;color:#2A2A2A;box-shadow:0 1px 4px rgba(244,164,184,0.10);white-space:normal;word-break:break-word;text-align:center;line-height:1.3">${text}</div>`,
    className: 'route-label',
    iconSize: [180, 40],
    iconAnchor: [90, 20]
  })
}

export interface MapViewProps {
  data: ItineraryData
  activeDay: number | null
  resetView: number
  onShowTransit?: (detail: TransitDetail) => void
  onShowLocationDetail?: (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => void
  showLocationNames?: boolean
  showTransitLabels?: boolean
  onZoomChange?: (zoom: number) => void
}

const DISTRICT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function MapView({ data, activeDay, resetView, onShowTransit, onShowLocationDetail, showLocationNames = false, showTransitLabels = false, onZoomChange }: MapViewProps): JSX.Element {
  const defaultCenter = useMemo<[number, number]>(() => {
    if (data.metadata.mapCenter) {
      return [data.metadata.mapCenter.lat, data.metadata.mapCenter.lng]
    }
    const locs = Object.values(data.locations)
    if (locs.length > 0) {
      const lat = locs.reduce((sum, l) => sum + l.lat, 0) / locs.length
      const lng = locs.reduce((sum, l) => sum + l.lng, 0) / locs.length
      return [lat, lng]
    }
    return [0, 0]
  }, [data])

  const defaultZoom = data.metadata.mapZoom ?? 12

  const { districtOrder, spotOrder } = useMemo(() => {
    const districtMap: Record<string, string> = {}
    const spotMap: Record<string, string> = {}

    if (activeDay !== null) {
      const day = data.days[activeDay]
      if (day) {
        let districtIdx = 0
        let spotIdx = 1

        for (const point of day.path) {
          const loc = data.locations[point.locationId]
          if (!loc) continue

          if (loc.type === 'spot') {
            if (!spotMap[loc.id]) {
              spotMap[loc.id] = String(spotIdx++)
            }
            if (loc.parentId) {
              const parent = data.locations[loc.parentId]
              if (parent && parent.type === 'group' && !districtMap[parent.id]) {
                districtMap[parent.id] = DISTRICT_LETTERS[districtIdx++] ?? ''
              }
            }
          }
        }
      }
    }

    return { districtOrder: districtMap, spotOrder: spotMap }
  }, [activeDay, data])

  const activePath = useMemo(() => {
    if (activeDay === null) return null
    return data.days[activeDay]?.path || null
  }, [activeDay, data])

  const routePoints = useMemo(() => {
    if (!activePath) return []
    return activePath
      .map(point => {
        const loc = data.locations[point.locationId]
        return loc ? { point, location: loc } : null
      })
      .filter((item): item is { point: typeof activePath[0]; location: LocationOrGroup } => item !== null)
  }, [activePath, data.locations])

  return (
    <MapContainer
      className={styles.mapContainer}
      style={{ height: '100%', width: '100%' }}
      center={defaultCenter}
      zoom={defaultZoom}
      zoomControl={false}
    >
      <SmartTileLayer country={data.metadata.country} />
      <MapController activeDay={activeDay} resetView={resetView} data={data} defaultCenter={defaultCenter} defaultZoom={defaultZoom} onZoomChange={onZoomChange} />

      {(() => {
        if (activeDay === null) {
          return Object.values(data.locations)
            .filter((location) => {
              if (location.type !== 'spot' || !location.parentId) return true
              const parent = data.locations[location.parentId]
              if (parent && parent.lat === location.lat && parent.lng === location.lng) return false
              return true
            })
            .map((location) => (
              <Marker
                key={`${location.id}-all`}
                position={[location.lat, location.lng]}
                icon={createCustomMarker(location, '', showLocationNames)}
                zIndexOffset={location.type === 'hotel_group' ? 500 : 0}
                eventHandlers={
                  onShowLocationDetail
                    ? { click: () => onShowLocationDetail(location, undefined, activeDay ?? undefined) }
                    : undefined
                }
              />
            ))
        }

        const day = data.days[activeDay]
        if (!day) return null

        const spotsInPath: { point: typeof day.path[0]; location: Location }[] = []
        const hotelsInPath: { point: typeof day.path[0]; location: LocationGroup }[] = []
        const districtsInPath = new Map<string, LocationGroup>()

        for (const point of day.path) {
          const loc = data.locations[point.locationId]
          if (!loc) continue
          if (loc.type === 'spot') {
            spotsInPath.push({ point, location: loc })
            if (loc.parentId) {
              const parent = data.locations[loc.parentId]
              if (parent && parent.type === 'group') {
                districtsInPath.set(parent.id, parent)
              }
            }
          } else if (loc.type === 'hotel_group') {
            hotelsInPath.push({ point, location: loc })
          }
        }

        const markers: JSX.Element[] = []

        for (const location of districtsInPath.values()) {
          const badge = districtOrder[location.id] || ''
          markers.push(
            <Marker
              key={`${location.id}-${activeDay}-${badge}`}
              position={[location.lat, location.lng]}
              icon={createCustomMarker(location, badge, showLocationNames)}
              zIndexOffset={-100}
              eventHandlers={
                onShowLocationDetail
                  ? { click: () => onShowLocationDetail(location, undefined, activeDay ?? undefined) }
                  : undefined
              }
            />
          )
        }

        for (const { point, location } of hotelsInPath) {
          markers.push(
            <Marker
              key={`${location.id}-${activeDay}-hotel`}
              position={[location.lat, location.lng]}
              icon={createCustomMarker(location, '', showLocationNames)}
              zIndexOffset={500}
              eventHandlers={
                onShowLocationDetail
                  ? { click: () => onShowLocationDetail(location, point.notes, activeDay ?? undefined) }
                  : undefined
              }
            />
          )
        }

        if (!hotelsInPath.some(h => h.location.id === day.baseHotelId)) {
          const baseHotel = data.locations[day.baseHotelId]
          if (baseHotel && baseHotel.type === 'hotel_group') {
            markers.push(
              <Marker
                key={`${baseHotel.id}-${activeDay}-basehotel`}
                position={[baseHotel.lat, baseHotel.lng]}
                icon={createCustomMarker(baseHotel, '', showLocationNames)}
                zIndexOffset={500}
                eventHandlers={
                  onShowLocationDetail
                    ? { click: () => onShowLocationDetail(baseHotel, undefined, activeDay ?? undefined) }
                    : undefined
                }
              />
            )
          }
        }

        for (const { point, location } of spotsInPath) {
          // Skip if the spot overlaps with its parent district
          if (location.parentId) {
            const parent = data.locations[location.parentId]
            if (parent && parent.lat === location.lat && parent.lng === location.lng) continue
          }
          const badge = spotOrder[location.id] || ''
          markers.push(
            <Marker
              key={`${location.id}-${activeDay}-${badge}`}
              position={[location.lat, location.lng]}
              icon={createCustomMarker(location, badge, showLocationNames)}
              eventHandlers={
                onShowLocationDetail
                  ? { click: () => onShowLocationDetail(location, point.notes, activeDay ?? undefined) }
                  : undefined
              }
            />
          )
        }

        return markers
      })()}

      {routePoints.length > 1 &&
        Array.from({ length: routePoints.length - 1 }).map((_, i) => {
          const p1 = routePoints[i]
          const p2 = routePoints[i + 1]
          const color = p2.location.color
          const positions = [
            [p1.location.lat, p1.location.lng],
            [p2.location.lat, p2.location.lng]
          ] as [number, number][]
          return (
            <Fragment key={`route-${activeDay ?? 'all'}-${i}`}>
              {/* Glow halo */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color,
                  weight: 9,
                  opacity: 0.18,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              {/* Core line */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color,
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '6, 6',
                  lineCap: 'round',
                  className: 'route-draw'
                }}
              />
            </Fragment>
          )
        })}

      {showTransitLabels &&
        routePoints.length > 1 &&
        Array.from({ length: routePoints.length - 1 }).map((_, i) => {
          const p1 = routePoints[i]
          const p2 = routePoints[i + 1]
          if (!p2.point.label) return null
          const midLat = (p1.location.lat + p2.location.lat) / 2
          const midLng = (p1.location.lng + p2.location.lng) / 2
          const transitData = p1.point.transit
          return (
            <Marker
              key={`label-${i}`}
              position={[midLat, midLng]}
              icon={createRouteLabelIcon(p2.point.label)}
              zIndexOffset={1000}
              eventHandlers={
                onShowTransit && transitData
                  ? { click: () => onShowTransit(transitData) }
                  : undefined
              }
            />
          )
        })}
    </MapContainer>
  )
}
