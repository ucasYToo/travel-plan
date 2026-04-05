import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ItineraryData, TransitDetail, LocationOrGroup, LocationGroup } from '../types'

interface MapControllerProps {
  activeDay: number | null
  resetView: number
  data: ItineraryData
}

function MapController({ activeDay, resetView, data }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    const zoomControl = L.control.zoom({ position: 'bottomright' })
    zoomControl.addTo(map)
    return () => {
      map.removeControl(zoomControl)
    }
  }, [map])

  useEffect(() => {
    if (activeDay !== null) {
      const day = data.days[activeDay]
      if (day && day.path.length > 1) {
        // Focus on the first non-hotel point, or second point if first is hotel
        const focusPoint = day.path.find(p => !p.isHotel) || day.path[1] || day.path[0]
        if (focusPoint) {
          const loc = data.locations[focusPoint.locationId]
          if (loc) {
            map.flyTo([loc.lat, loc.lng], 15, { duration: 1 })
          }
        }
      }
    } else {
      map.flyTo([37.545, 126.96], 12, { duration: 1 })
    }
  }, [map, activeDay, resetView, data])

  return null
}

// Type guard to check if location is a group
function isLocationGroup(loc: LocationOrGroup): loc is LocationGroup {
  return loc.type === 'group' || loc.type === 'hotel_group'
}

function createCustomMarker(location: LocationOrGroup, badge?: string): L.DivIcon {
  const isGroup = isLocationGroup(location)
  const isHotelGroup = location.type === 'hotel_group'
  // Groups (商圈/酒店组): 40px, Spots (子地点): 24px
  const size = isGroup ? 40 : 24
  const svgColor = location.color

  const orderBadge = badge
    ? `<div style="position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;padding:0 5px;background:#111827;color:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);z-index:10">${badge}</div>`
    : ''

  // Hotel group uses "住" badge, regular group uses location pin, spot uses smaller pin
  const svg = isHotelGroup
    ? `<div style="width:40px;height:40px;background:${svgColor};border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:13px">住</div>`
    : isGroup
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${svgColor}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${svgColor}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`

  const iconHtml = `<div class="marker-pulse" style="color: ${svgColor}; position:relative; display:inline-block">${svg}${orderBadge}</div>`

  // Spots get a slight offset to avoid fully overlapping their parent group
  const anchorShift = !isGroup && badge ? 8 : 0

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2 + anchorShift, size - anchorShift / 2],
    popupAnchor: [0, -size + anchorShift / 2]
  })
}

function createRouteLabelIcon(text: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="max-width:180px;padding:4px 10px;background:#fff;border:1px solid #d1d5db;border-radius:9999px;font-size:11px;font-weight:600;color:#1f2937;box-shadow:0 1px 4px rgba(0,0,0,0.12);white-space:normal;word-break:break-word;text-align:center;line-height:1.3">${text}</div>`,
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
}

const DISTRICT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function MapView({ data, activeDay, resetView, onShowTransit }: MapViewProps): JSX.Element {
  const { locationOrder, spotOrder } = useMemo(() => {
    const locMap: Record<string, string> = {}
    const spotMap: Record<string, string> = {}

    if (activeDay !== null) {
      const day = data.days[activeDay]
      if (day) {
        let locIdx = 0
        let spotIdx = 1

        for (const point of day.path) {
          const loc = data.locations[point.locationId]
          if (!loc) continue

          if (loc.type === 'group') {
            if (!locMap[loc.id]) {
              locMap[loc.id] = DISTRICT_LETTERS[locIdx++] ?? ''
            }
          } else if (loc.type === 'spot' || loc.type === 'hotel_group') {
            if (!spotMap[loc.id]) {
              spotMap[loc.id] = String(spotIdx++)
            }
          }
        }
      }
    }

    return { locationOrder: locMap, spotOrder: spotMap }
  }, [activeDay, data])

  const visibleHotels = useMemo(() => {
    const set = new Set<string>()
    if (activeDay !== null) {
      const day = data.days[activeDay]
      if (day) {
        set.add(day.baseHotelId)
        // Also add any hotels in the path
        for (const point of day.path) {
          if (point.isHotel) {
            set.add(point.locationId)
          }
        }
      }
    }
    return set
  }, [activeDay, data])

  const activePath = useMemo(() => {
    if (activeDay === null) return null
    return data.days[activeDay]?.path || null
  }, [activeDay, data])

  // Get path points with location data for rendering
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
      className="absolute inset-0 z-0"
      style={{ height: '100%', width: '100%' }}
      center={[37.545, 126.96]}
      zoom={12}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <MapController activeDay={activeDay} resetView={resetView} data={data} />

      {/* Render all locations */}
      {Object.values(data.locations).map((location) => {
        // Determine visibility and badge
        let isVisible = activeDay === null
        let badge = ''

        if (activeDay !== null) {
          const day = data.days[activeDay]
          if (day) {
            const inPath = day.path.some(p => p.locationId === location.id)
            if (inPath) {
              isVisible = true
              // Groups (商圈/酒店组) use ABC, spots (子地点) use 123
              if (location.type === 'group' || location.type === 'hotel_group') {
                badge = locationOrder[location.id] || ''
              } else if (location.type === 'spot') {
                badge = spotOrder[location.id] || ''
              }
            }
            // Hotel groups in path are always visible
            if (location.type === 'hotel_group' && visibleHotels.has(location.id)) {
              isVisible = true
            }
          }
        }

        if (!isVisible) return null

        const markerKey = `${location.id}-${activeDay ?? 'none'}-${badge}`

        return (
          <Marker
            key={markerKey}
            position={[location.lat, location.lng]}
            icon={createCustomMarker(location, badge)}
            zIndexOffset={location.type === 'hotel_group' ? 500 : 0}
          >
            <Popup>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: location.color }}
                  />
                  <h3 className="font-bold text-gray-900">{location.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{location.description}</p>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Render route polylines */}
      {routePoints.length > 1 &&
        Array.from({ length: routePoints.length - 1 }).map((_, i) => {
          const p1 = routePoints[i]
          const p2 = routePoints[i + 1]
          const color = p2.location.color
          return (
            <Polyline
              key={`route-${i}`}
              positions={[
                [p1.location.lat, p1.location.lng],
                [p2.location.lat, p2.location.lng]
              ]}
              pathOptions={{
                color,
                weight: 3,
                opacity: 0.7,
                dashArray: '6, 6',
                lineCap: 'round'
              }}
            />
          )
        })}

      {/* Render route labels */}
      {routePoints.length > 1 &&
        Array.from({ length: routePoints.length - 1 }).map((_, i) => {
          const p1 = routePoints[i]
          const p2 = routePoints[i + 1]
          if (!p2.point.label) return null
          const midLat = (p1.location.lat + p2.location.lat) / 2
          const midLng = (p1.location.lng + p2.location.lng) / 2
          return (
            <Marker
              key={`label-${i}`}
              position={[midLat, midLng]}
              icon={createRouteLabelIcon(p2.point.label)}
              zIndexOffset={1000}
              eventHandlers={
                onShowTransit && p2.point.transit
                  ? { click: () => onShowTransit(p2.point.transit!) }
                  : undefined
              }
            />
          )
        })}
    </MapContainer>
  )
}
