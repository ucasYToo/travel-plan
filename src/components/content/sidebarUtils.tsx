import type { ItineraryData, TransitDetail, DayPlan, LocationOrGroup, NoteItem } from '../../types'
import clsx from 'clsx'
import styles from './SidebarContent.module.css'

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function getPathLocations(day: DayPlan, locations: Record<string, LocationOrGroup>) {
  return day.path
    .map((point, index) => {
      const loc = locations[point.locationId]
      if (!loc) return null
      return { point, location: loc, index }
    })
    .filter((item): item is { point: typeof day.path[0]; location: LocationOrGroup; index: number } => item !== null)
}

export function getHotels(locations: Record<string, LocationOrGroup>) {
  return Object.values(locations).filter(loc => loc.type === 'hotel_group')
}

export function buildBadges(path: { location: LocationOrGroup }[], locations: Record<string, LocationOrGroup>) {
  let districtIdx = 0
  let spotIdx = 1
  const districtBadges: Record<string, string> = {}
  const spotBadges: Record<string, string> = {}

  for (const { location } of path) {
    if (location.type === 'spot') {
      if (!spotBadges[location.id]) spotBadges[location.id] = String(spotIdx++)
      if (location.parentId) {
        const parent = locations[location.parentId]
        if (parent && parent.type === 'group' && !districtBadges[parent.id]) {
          districtBadges[parent.id] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[districtIdx++] || ''
        }
      }
    }
  }
  return { districtBadges, spotBadges }
}

export function buildRouteItems(
  day: DayPlan,
  data: ItineraryData,
  activeDay: number,
  onShowLocationDetail?: (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => void,
  onShowTransit?: (detail: TransitDetail) => void,
) {
  const pathWithLocations = getPathLocations(day, data.locations)
  const { districtBadges, spotBadges } = buildBadges(pathWithLocations, data.locations)
  const pathSlice = pathWithLocations
  const routeItems: JSX.Element[] = []
  let currentDistrictId: string | null = null

  pathSlice.forEach(({ point, location }, idx) => {
    if (location.type === 'spot') {
      const parent = location.parentId ? data.locations[location.parentId] : null
      const parentIsDistrict = parent && parent.type === 'group'

      if (parentIsDistrict && parent.id !== currentDistrictId) {
        currentDistrictId = parent.id
        routeItems.push(
          <div
            key={`district-${idx}`}
            className={clsx(styles.tlNode, styles.tlDistrict, {
              [styles.tlClickable]: !!onShowLocationDetail,
            })}
            onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(parent, undefined, activeDay) } : undefined}
          >
            <div className={styles.tlBadge} style={{ background: parent.color }}>
              {districtBadges[parent.id] || '●'}
            </div>
            <span className={styles.tlName}>{parent.name}</span>
            {onShowLocationDetail && <span className={styles.tlAction}>详情</span>}
          </div>
        )
      }

      if (!parentIsDistrict) currentDistrictId = null

      routeItems.push(
        <div
          key={`loc-${idx}`}
          className={clsx(styles.tlNode, styles.tlSpot, {
            [styles.tlClickable]: !!onShowLocationDetail,
          })}
          onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, activeDay) } : undefined}
        >
          <div className={styles.tlDot} style={{ background: location.color }}>
            {spotBadges[location.id] || '•'}
          </div>
          <span className={styles.tlName}>{location.name}</span>
          {onShowLocationDetail && <span className={styles.tlAction}>详情</span>}
        </div>
      )
    } else if (location.type === 'hotel_group') {
      currentDistrictId = null
      routeItems.push(
        <div
          key={`hotel-${idx}`}
          className={clsx(styles.tlNode, styles.tlHotel, {
            [styles.tlClickable]: !!onShowLocationDetail,
          })}
          onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, activeDay) } : undefined}
        >
          <div className={styles.tlBadge} style={{ background: location.color }}>
            住
          </div>
          <span className={styles.tlName}>{location.name}</span>
          {onShowLocationDetail && <span className={styles.tlAction}>详情</span>}
        </div>
      )
    }

    if (idx < pathSlice.length - 1) {
      const nextPoint = pathSlice[idx + 1]?.point
      const transitData = nextPoint?.transit || point.transit
      if (transitData && nextPoint?.label) {
        const isSubway = transitData.steps.some(s => s.mode === 'subway')
        const isTrain = transitData.steps.some(s => s.mode === 'train')
        const isBus = transitData.steps.some(s => s.mode === 'bus')
        const modeIcon = isTrain ? '🚆' : isSubway ? '🚇' : isBus ? '🚌' : '🚶'

        routeItems.push(
          <div
            key={`transit-${idx}`}
            className={clsx(styles.tlTransit, {
              [styles.tlTransitClickable]: !!onShowTransit,
            })}
            onClick={onShowTransit ? (e) => { e.stopPropagation(); onShowTransit(transitData) } : undefined}
          >
            <span className={styles.tlTransitIcon}>{modeIcon}</span>
            <span className={styles.tlTransitLabel}>{nextPoint.label}</span>
            {onShowTransit && <span className={styles.tlTransitAction}>详情</span>}
          </div>
        )
      }
    }
  })

  return routeItems
}
