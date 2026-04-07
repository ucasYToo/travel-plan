import type { ItineraryData, TransitDetail, DayPlan, LocationOrGroup, NoteItem } from '../../types'
import clsx from 'clsx'
import styles from './SidebarContent.module.css'

// 格式化日期显示 (2026-04-29 -> 4月29日)
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化日期标题
function formatDayTitle(day: DayPlan): string {
  if (day.date) {
    return `${formatDate(day.date)} · ${day.title}`
  }
  return `Day ${day.day} · ${day.title}`
}

// 获取路径中的地点信息
function getPathLocations(day: DayPlan, locations: Record<string, LocationOrGroup>) {
  return day.path
    .map((point, index) => {
      const loc = locations[point.locationId]
      if (!loc) return null
      return { point, location: loc, index }
    })
    .filter((item): item is { point: typeof day.path[0]; location: LocationOrGroup; index: number } => item !== null)
}

// 获取酒店信息
function getHotels(locations: Record<string, LocationOrGroup>) {
  return Object.values(locations).filter(loc => loc.type === 'hotel_group')
}

export interface SidebarContentProps {
  data: ItineraryData
  activeDay: number | null
  onSelectDay: (index: number) => void
  onShowTransit?: (detail: TransitDetail) => void
  onShowLocationDetail?: (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => void
}

export function SidebarContent({ data, activeDay, onSelectDay, onShowTransit, onShowLocationDetail }: SidebarContentProps) {
  const hotels = getHotels(data.locations)

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{data.metadata.title}</h1>
        <p className={styles.subtitle}>{data.metadata.subtitle}</p>
      </div>

      {/* Scrollable Content */}
      <div className={styles.scrollable}>
        {/* Hotels Info */}
        {hotels.length > 0 && (
          <div className={clsx(styles.hotelGrid, hotels.length === 2 && styles.hotelGrid2Cols)}>
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className={styles.hotelCard}
                style={{ borderColor: `${hotel.color}40` }}
              >
                <div className={styles.hotelHeader}>
                  <div
                    className={styles.hotelIcon}
                    style={{ backgroundColor: hotel.color }}
                  >
                    住
                  </div>
                  <p className={styles.hotelName}>{hotel.name}</p>
                </div>
                <p className={styles.hotelDesc}>{hotel.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Itinerary Section */}
        <section>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIndicator} />
            {data.days.length} 日行程
          </h2>
          <div className={styles.dayList}>
            {data.days.map((day, index) => {
              const baseHotel = data.locations[day.baseHotelId]
              const pathWithLocations = getPathLocations(day, data.locations)

              const startIndex = 0

              // Build badges
              let districtIdx = 0
              let spotIdx = 1
              const districtBadges: Record<string, string> = {}
              const spotBadges: Record<string, string> = {}

              pathWithLocations.slice(startIndex).forEach(({ location }) => {
                if (location.type === 'spot') {
                  if (!spotBadges[location.id]) {
                    spotBadges[location.id] = String(spotIdx++)
                  }
                  if (location.parentId) {
                    const parent = data.locations[location.parentId]
                    if (parent && parent.type === 'group' && !districtBadges[parent.id]) {
                      districtBadges[parent.id] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[districtIdx++] || ''
                    }
                  }
                }
              })

              const routeItems: JSX.Element[] = []
              const pathSlice = pathWithLocations.slice(startIndex)
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
                        className={clsx(styles.districtRow, {
                          [styles.districtRowHover]: !!onShowLocationDetail,
                          [styles.cursorPointer]: !!onShowLocationDetail,
                        })}
                        onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(parent, undefined, index) } : undefined}
                      >
                        <span
                          className={styles.rowIcon}
                          style={{ background: parent.color }}
                        >
                          {districtBadges[parent.id] || '●'}
                        </span>
                        <span className={styles.rowName}>{parent.name}</span>
                        {onShowLocationDetail ? (
                          <span className={styles.rowAction}>详情</span>
                        ) : null}
                      </div>
                    )
                  }

                  if (!parentIsDistrict) {
                    currentDistrictId = null
                  }

                  const badge = spotBadges[location.id] || ''
                  routeItems.push(
                    <div
                      key={`loc-${idx}`}
                      className={clsx(styles.spotRow, {
                        [styles.spotRowHover]: !!onShowLocationDetail,
                        [styles.cursorPointer]: !!onShowLocationDetail,
                      })}
                      onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, index) } : undefined}
                    >
                      <span
                        className={styles.rowIconSmall}
                        style={{ background: location.color }}
                      >
                        {badge || '•'}
                      </span>
                      <span className={styles.rowName}>{location.name}</span>
                      {onShowLocationDetail ? (
                        <span className={styles.rowAction}>详情</span>
                      ) : null}
                    </div>
                  )
                } else if (location.type === 'hotel_group') {
                  currentDistrictId = null
                  routeItems.push(
                    <div
                      key={`hotel-${idx}`}
                      className={clsx(styles.districtRow, {
                        [styles.districtRowHover]: !!onShowLocationDetail,
                        [styles.cursorPointer]: !!onShowLocationDetail,
                      })}
                      onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, index) } : undefined}
                    >
                      <span
                        className={styles.rowIcon}
                        style={{ background: location.color }}
                      >
                        住
                      </span>
                      <span className={styles.rowName}>{location.name}</span>
                      {onShowLocationDetail ? (
                        <span className={styles.rowAction}>详情</span>
                      ) : null}
                    </div>
                  )
                }

                // Transit line
                if (idx < pathSlice.length - 1) {
                  const nextPoint = pathSlice[idx + 1]?.point
                  const transitData = nextPoint?.transit || point.transit
                  if (transitData && nextPoint?.label) {
                    routeItems.push(
                      <div
                        key={`transit-${idx}`}
                        className={styles.transitRow}
                        onClick={onShowTransit ? (e) => { e.stopPropagation(); onShowTransit(transitData) } : undefined}
                      >
                        <span className={styles.transitPrefix}>└─</span>
                        <span className={styles.transitLabel}>{nextPoint.label}</span>
                        <span className={styles.transitAction}>交通</span>
                      </div>
                    )
                  }
                }
              })

              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => onSelectDay(index)}
                  className={clsx(styles.dayCard, activeDay === index && styles.dayCardActive)}
                >
                  <div className={styles.dayHeader}>
                    <h3 className={clsx(styles.dayTitle, activeDay === index && styles.dayTitleActive)}>
                      {formatDayTitle(day)}
                    </h3>
                    {baseHotel && (
                      <span
                        className={styles.badgePill}
                        style={{ backgroundColor: baseHotel.color }}
                      >
                        {baseHotel.name.replace('Aank Hotel ', '').replace('酒店', '').slice(0, 4)}
                      </span>
                    )}
                  </div>
                  <p className={styles.dayNote}>{day.note}</p>
                  {routeItems.length > 0 && (
                    <div className={styles.routeBox}>
                      {routeItems}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
