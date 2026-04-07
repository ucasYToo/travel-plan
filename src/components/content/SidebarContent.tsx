import type { ItineraryData, TransitDetail, DayPlan, LocationOrGroup, NoteItem } from '../../types'

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
      <div className="px-6 py-5 border-b border-[var(--border-spring)] shrink-0">
        <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--ink)]">{data.metadata.title}</h1>
        <p className="text-xs text-[var(--stone)] mt-1.5 font-medium tracking-wide">{data.metadata.subtitle}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto sidebar-scroll p-5 space-y-6">
        {/* Hotels Info */}
        {hotels.length > 0 && (
          <div className={`grid gap-3 ${hotels.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="p-3 rounded-2xl border border-[var(--border-spring)] bg-[var(--bg-card)] transition hover:shadow-spring"
                style={{ borderColor: `${hotel.color}40` }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                    style={{ backgroundColor: hotel.color }}
                  >
                    住
                  </div>
                  <p className="font-semibold text-[var(--ink)] text-xs truncate">{hotel.name}</p>
                </div>
                <p className="text-[10px] text-[var(--stone)] leading-relaxed line-clamp-2">{hotel.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Itinerary Section */}
        <section>
          <h2 className="text-xs font-semibold text-[var(--stone)] mb-4 flex items-center gap-2 tracking-wide uppercase">
            <span className="w-1 h-4 bg-[var(--sakura-pink)] rounded-full" />
            {data.days.length} 日行程
          </h2>
          <div className="space-y-3">
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
                        className={[
                          'flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-1 text-xs text-[var(--ink)] font-medium bg-[var(--bg-card)] border border-[var(--border-spring)]',
                          onShowLocationDetail ? 'cursor-pointer hover:border-[var(--sakura-pink)]' : ''
                        ].join(' ')}
                        onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(parent, undefined, index) } : undefined}
                      >
                        <span
                          className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-semibold"
                          style={{ background: parent.color }}
                        >
                          {districtBadges[parent.id] || '●'}
                        </span>
                        <span className="flex-1 min-w-0">{parent.name}</span>
                        {onShowLocationDetail ? (
                          <span className="ml-auto text-[10px] text-[var(--sakura-deep)] shrink-0 font-medium">详情</span>
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
                      className={[
                        'flex items-center gap-2 rounded-lg px-2 py-1 -mx-1 transition text-[10px] text-[var(--stone)] ml-4',
                        onShowLocationDetail ? 'cursor-pointer hover:bg-[var(--bg-card)]' : ''
                      ].join(' ')}
                      onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, index) } : undefined}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-semibold"
                        style={{ background: location.color }}
                      >
                        {badge || '•'}
                      </span>
                      <span className="flex-1 min-w-0">{location.name}</span>
                      {onShowLocationDetail ? (
                        <span className="ml-auto text-[10px] text-[var(--sakura-deep)] shrink-0 font-medium">详情</span>
                      ) : null}
                    </div>
                  )
                } else if (location.type === 'hotel_group') {
                  currentDistrictId = null
                  routeItems.push(
                    <div
                      key={`hotel-${idx}`}
                      className={[
                        'flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-1 text-xs text-[var(--ink)] font-medium bg-[var(--bg-card)] border border-[var(--border-spring)]',
                        onShowLocationDetail ? 'cursor-pointer hover:border-[var(--sakura-pink)]' : ''
                      ].join(' ')}
                      onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, index) } : undefined}
                    >
                      <span
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-semibold"
                        style={{ background: location.color }}
                      >
                        住
                      </span>
                      <span className="flex-1 min-w-0">{location.name}</span>
                      {onShowLocationDetail ? (
                        <span className="ml-auto text-[10px] text-[var(--sakura-deep)] shrink-0 font-medium">详情</span>
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
                        className="flex items-center gap-2 py-0.5 ml-6 cursor-pointer hover:bg-[var(--bg-card)] rounded-lg px-2 -mx-1 transition"
                        onClick={onShowTransit ? (e) => { e.stopPropagation(); onShowTransit(transitData) } : undefined}
                      >
                        <span className="text-[var(--mist)] text-xs">└─</span>
                        <span className="text-[10px] text-[var(--stone)]">{nextPoint.label}</span>
                        <span className="text-[10px] text-[var(--sakura-deep)] ml-auto font-medium">交通</span>
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
                  className={[
                    'day-card w-full text-left p-4 rounded-2xl border transition-all cursor-pointer shadow-spring',
                    'hover:border-[var(--sakura-pink)] hover:shadow-spring-lg',
                    activeDay === index ? 'border-[var(--sakura-pink)] bg-[var(--sakura-pale)]' : 'border-[var(--border-spring)] bg-[var(--bg-card)]'
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={['font-display font-semibold text-[var(--ink)] text-lg tracking-tight', activeDay === index ? 'text-[var(--sakura-deep)]' : ''].join(' ')}>
                      {formatDayTitle(day)}
                    </h3>
                    {baseHotel && (
                      <span
                        className="text-[10px] px-2.5 py-0.5 rounded-full text-white font-medium whitespace-nowrap shrink-0 ml-2"
                        style={{ backgroundColor: baseHotel.color }}
                      >
                        {baseHotel.name.replace('Aank Hotel ', '').replace('酒店', '').slice(0, 4)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--stone)] mb-3 leading-relaxed">{day.note}</p>
                  {routeItems.length > 0 && (
                    <div className="rounded-xl border border-[var(--border-spring)] bg-[var(--bg-main)] p-2.5 space-y-1">
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
