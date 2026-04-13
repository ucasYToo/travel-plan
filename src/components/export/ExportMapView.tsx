import { Fragment, useMemo } from 'react'
import { Marker, Polyline } from 'react-leaflet'
import { MapController } from '../MapController'
import { createCustomMarker, createRouteLabelIcon } from '../mapMarkers'
import { ExportSmartTileLayer } from './ExportSmartTileLayer'
import { getDayColorMap, excludeOutlierLocations } from './exportMapUtils'
import type { ItineraryData, LocationOrGroup, LocationGroup, Location } from '../../types'

interface ExportMapControllerProps {
  activeDay: number | null
  resetView: number
  data: ItineraryData
  defaultCenter: [number, number]
  defaultZoom: number
}

function ExportMapController({ activeDay, resetView, data, defaultCenter, defaultZoom }: ExportMapControllerProps) {
  return (
    <MapController
      activeDay={activeDay}
      resetView={resetView}
      data={data}
      defaultCenter={defaultCenter}
      defaultZoom={defaultZoom}
    />
  )
}

const DISTRICT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export interface ExportMapViewProps {
  data: ItineraryData
  activeDay: number | null
  resetView: number
  showLocationNames?: boolean
  showTransitLabels?: boolean
  trackTile?: (img: HTMLImageElement) => void
  country?: string
  colorizeByDay?: boolean
  excludeOutliers?: boolean
}

export function ExportMapView({
  data,
  activeDay,
  resetView,
  showLocationNames = false,
  showTransitLabels = false,
  trackTile,
  country,
  colorizeByDay,
  excludeOutliers,
}: ExportMapViewProps): JSX.Element {
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

  const dayColorMap = useMemo(() => {
    if (!colorizeByDay) return null
    return getDayColorMap(data)
  }, [colorizeByDay, data])

  const filteredLocations = useMemo(() => {
    if (!excludeOutliers) return data.locations
    return excludeOutlierLocations(data, activeDay)
  }, [excludeOutliers, activeDay, data])

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
      .filter((item): item is { point: typeof activePath[0]; location: LocationOrGroup } => {
        if (!item) return false
        if (excludeOutliers && !filteredLocations[item.point.locationId]) return false
        return true
      })
  }, [activePath, data.locations, excludeOutliers, filteredLocations])

  return (
    <>
      <ExportSmartTileLayer country={country} trackTile={trackTile} />
      <ExportMapController
        activeDay={activeDay}
        resetView={resetView}
        data={{ ...data, locations: filteredLocations }}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
      />

      {(() => {
        if (activeDay === null) {
          return Object.values(filteredLocations)
            .filter((location) => {
              if (location.type !== 'spot' || !location.parentId) return true
              const parent = filteredLocations[location.parentId]
              if (parent && parent.lat === location.lat && parent.lng === location.lng) return false
              return true
            })
            .map((location) => {
              const color = dayColorMap?.[location.id]
              return (
                <Marker
                  key={`${location.id}-all`}
                  position={[location.lat, location.lng]}
                  icon={createCustomMarker(location, '', showLocationNames, color)}
                  zIndexOffset={location.type === 'hotel_group' ? 500 : 0}
                />
              )
            })
        }

        const day = data.days[activeDay]
        if (!day) return null

        const spotsInPath: { point: typeof day.path[0]; location: Location }[] = []
        const hotelsInPath: { point: typeof day.path[0]; location: LocationGroup }[] = []
        const districtsInPath = new Map<string, LocationGroup>()

        for (const point of day.path) {
          const loc = data.locations[point.locationId]
          if (!loc) continue
          if (excludeOutliers && !filteredLocations[point.locationId]) continue
          if (loc.type === 'spot') {
            spotsInPath.push({ point, location: loc })
            if (loc.parentId) {
              const parent = data.locations[loc.parentId]
              if (parent && parent.type === 'group') {
                if (!excludeOutliers || filteredLocations[loc.parentId]) {
                  districtsInPath.set(parent.id, parent)
                }
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
            />
          )
        }

        for (const { location } of hotelsInPath) {
          markers.push(
            <Marker
              key={`${location.id}-${activeDay}-hotel`}
              position={[location.lat, location.lng]}
              icon={createCustomMarker(location, '', showLocationNames)}
              zIndexOffset={500}
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
              />
            )
          }
        }

        for (const { location } of spotsInPath) {
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
          return (
            <Marker
              key={`label-${i}`}
              position={[midLat, midLng]}
              icon={createRouteLabelIcon(p2.point.label)}
              zIndexOffset={1000}
            />
          )
        })}
    </>
  )
}
