import { useMemo, Fragment } from 'react'
import { MapContainer, Marker, Polyline } from 'react-leaflet'
import { SmartTileLayer } from './SmartTileLayer'
import styles from './MapView.module.css'
import type { ItineraryData, TransitDetail, LocationOrGroup, LocationGroup, Location, NoteItem } from '../types'
import { MapController } from './MapController'
import type { MapViewportPadding } from './MapController'
import { createCustomMarker, createRouteLabelIcon } from './mapMarkers'

export function MapView({ data, activeDay, resetView, onShowTransit, onShowLocationDetail, showLocationNames = false, showTransitLabels = false, onZoomChange, zoom = 12, viewportPadding }: MapViewProps): JSX.Element {
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

  const shouldShowMarkerName = (location: LocationOrGroup) => {
    if (!showLocationNames) return false
    if (location.type === 'spot') return activeDay !== null && zoom >= 14
    if (location.type === 'hotel_group') return true
    return activeDay !== null || zoom >= 12
  }

  return (
    <MapContainer
      className={styles.mapContainer}
      style={{ height: '100%', width: '100%' }}
      center={defaultCenter}
      zoom={defaultZoom}
      zoomControl={false}
    >
      <SmartTileLayer country={data.metadata.country} />
      <MapController activeDay={activeDay} resetView={resetView} data={data} defaultCenter={defaultCenter} defaultZoom={defaultZoom} onZoomChange={onZoomChange} viewportPadding={viewportPadding} />

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
                icon={createCustomMarker(location, '', shouldShowMarkerName(location))}
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
            if (!hotelsInPath.some((hotel) => hotel.location.id === loc.id)) {
              hotelsInPath.push({ point, location: loc })
            }
          }
        }

        const markers: JSX.Element[] = []

        for (const location of districtsInPath.values()) {
          const badge = districtOrder[location.id] || ''
          markers.push(
            <Marker
              key={`${location.id}-${activeDay}-${badge}`}
              position={[location.lat, location.lng]}
              icon={createCustomMarker(location, badge, shouldShowMarkerName(location))}
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
              icon={createCustomMarker(location, '', shouldShowMarkerName(location))}
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
                icon={createCustomMarker(baseHotel, '', shouldShowMarkerName(baseHotel))}
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
              icon={createCustomMarker(location, badge, shouldShowMarkerName(location))}
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

const DISTRICT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export interface MapViewProps {
  data: ItineraryData
  activeDay: number | null
  resetView: number
  onShowTransit?: (detail: TransitDetail) => void
  onShowLocationDetail?: (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => void
  showLocationNames?: boolean
  showTransitLabels?: boolean
  onZoomChange?: (zoom: number) => void
  zoom?: number
  viewportPadding?: MapViewportPadding
}
