import type { ItineraryData, TransitDetail, DayPlan, LocationOrGroup, NoteItem } from '../types'

// 格式化日期显示 (2026-04-29 -> 4月29日)
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化日期标题
function formatDayTitle(day: DayPlan): string {
  if (day.date) {
    return `${formatDate(day.date)} ${day.title}`
  }
  return `day ${day.day} ${day.title}`
}

export interface SidebarProps {
  data: ItineraryData
  activeDay: number | null
  onSelectDay: (index: number) => void
  isOpen: boolean
  onShowTransit?: (detail: TransitDetail) => void
  onShowLocationDetail?: (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => void
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

// 获取酒店信息（现在酒店是 hotel_group 类型）
function getHotels(locations: Record<string, LocationOrGroup>) {
  return Object.values(locations).filter(loc => loc.type === 'hotel_group')
}

export function Sidebar({ data, activeDay, onSelectDay, isOpen, onShowTransit, onShowLocationDetail }: SidebarProps): JSX.Element {
  const hotels = getHotels(data.locations)

  return (
    <aside
      className={`sidebar-panel absolute left-0 top-0 bottom-0 w-full sm:w-80 bg-white/95 backdrop-blur shadow-xl z-50 flex flex-col transition-transform duration-300 sm:static sm:translate-x-0 sm:shadow-none sm:col-start-1 sm:h-full ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#DFE6E9] bg-white shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-[#2D3436]">{data.metadata.title}</h1>
          <span className="text-[#A8E6CF]">🌱</span>
        </div>
        <p className="text-xs text-[#636E72] mt-1">{data.metadata.subtitle}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-5">
        {/* Hotels Info */}
        {hotels.length > 0 && (
          <div className={`grid gap-2 ${hotels.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="p-2 rounded-[16px] border"
                style={{ backgroundColor: `${hotel.color}15`, borderColor: `${hotel.color}30` }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: hotel.color }}
                  >
                    🏠
                  </div>
                  <p className="font-bold text-[#2D3436] text-xs truncate">{hotel.name}</p>
                </div>
                <p className="text-[10px] text-[#636E72] leading-tight line-clamp-2">{hotel.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Itinerary Section */}
        <section>
          <h2 className="text-sm font-bold text-[#2D3436] mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#A8E6CF] rounded-full"></span>
            {data.days.length}日行程规划
          </h2>
          <div className="space-y-2">
            {data.days.map((day, index) => {
              const baseHotel = data.locations[day.baseHotelId]
              const pathWithLocations = getPathLocations(day, data.locations)

              // Show full path including hotel start point for all days
              const startIndex = 0

              // Assign badges: groups (ABC) for districts, numbers (123) for spots
              let districtIdx = 0
              let spotIdx = 1
              const districtBadges: Record<string, string> = {}
              const spotBadges: Record<string, string> = {}

              pathWithLocations.slice(startIndex).forEach(({ location }) => {
                if (location.type === 'spot') {
                  if (!spotBadges[location.id]) {
                    spotBadges[location.id] = String(spotIdx++)
                  }
                  // Assign district badge for group-type parents
                  if (location.parentId) {
                    const parent = data.locations[location.parentId]
                    if (parent && parent.type === 'group' && !districtBadges[parent.id]) {
                      districtBadges[parent.id] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[districtIdx++] || ''
                    }
                  }
                }
              })

              // Build route items: group spots by their district parent
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
                          'flex items-center gap-2 rounded px-1.5 py-1 -mx-1 text-xs text-[#2D3436] font-medium bg-white border border-[#DFE6E9]',
                          onShowLocationDetail ? 'cursor-pointer hover:bg-[#F5F7FA]' : ''
                        ].join(' ')}
                        onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(parent, undefined, index) } : undefined}
                      >
                        <span
                          className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[10px]"
                          style={{ background: parent.color }}
                        >
                          {districtBadges[parent.id] || '●'}
                        </span>
                        <span className="flex-1 min-w-0">{parent.name}</span>
                        {onShowLocationDetail ? (
                          <span className="ml-auto text-[10px] text-[#88D8B0] shrink-0">查看详情</span>
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
                        'flex items-center gap-2 rounded px-1.5 py-1 -mx-1 transition text-[10px] text-[#636E72] ml-4',
                        onShowLocationDetail ? 'cursor-pointer hover:bg-[#F5F7FA]' : ''
                      ].join(' ')}
                      onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, index) } : undefined}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white text-[8px]"
                        style={{ background: location.color }}
                      >
                        {badge || '•'}
                      </span>
                      <span className="flex-1 min-w-0">{location.name}</span>
                      {onShowLocationDetail ? (
                        <span className="ml-auto text-[10px] text-[#88D8B0] shrink-0">查看详情</span>
                      ) : null}
                    </div>
                  )
                } else if (location.type === 'hotel_group') {
                  currentDistrictId = null
                  routeItems.push(
                    <div
                      key={`loc-${idx}`}
                      className={[
                        'flex items-center gap-2 rounded px-1.5 py-1 -mx-1 text-xs text-[#2D3436] font-medium bg-white border border-[#DFE6E9]',
                        onShowLocationDetail ? 'cursor-pointer hover:bg-[#F5F7FA]' : ''
                      ].join(' ')}
                      onClick={onShowLocationDetail ? (e) => { e.stopPropagation(); onShowLocationDetail(location, point.notes, index) } : undefined}
                    >
                      <span
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[10px]"
                        style={{ background: location.color }}
                      >
                        🏠
                      </span>
                      <span className="flex-1 min-w-0">{location.name}</span>
                      {onShowLocationDetail ? (
                        <span className="ml-auto text-[10px] text-[#88D8B0] shrink-0">查看详情</span>
                      ) : null}
                    </div>
                  )
                }

                // Transit line: show how to get to the next point
                if (idx < pathSlice.length - 1) {
                  const nextPoint = pathSlice[idx + 1]?.point
                  // Transit can be on nextPoint (Day 2+ destination) or current point (Day 1 airport source)
                  const transitData = nextPoint?.transit || point.transit
                  if (transitData && nextPoint?.label) {
                    routeItems.push(
                      <div
                        key={`transit-${idx}`}
                        className="flex items-center gap-2 py-0.5 ml-6 cursor-pointer hover:bg-[#F5F7FA] rounded px-1.5 -mx-1 transition"
                        onClick={onShowTransit ? (e) => { e.stopPropagation(); onShowTransit(transitData) } : undefined}
                      >
                        <span className="text-[#DFE6E9] text-xs">└─</span>
                        <span className="text-[10px] text-[#88D8B0]">{nextPoint.label}</span>
                        <span className="text-[10px] text-[#A8E6CF] ml-auto">交通详情</span>
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
                    'day-card w-full text-left p-4 rounded-[16px] border transition-all cursor-pointer shadow-soft',
                    'hover:border-[#DFE6E9] hover:shadow-soft-hover',
                    activeDay === index ? 'border-[#A8E6CF] bg-[#DCFAED]' : 'border-gray-100 bg-white'
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-[#2D3436] text-[18px]">{formatDayTitle(day)}</h3>
                    {baseHotel && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium whitespace-nowrap shrink-0 ml-2"
                        style={{ backgroundColor: baseHotel.color }}
                      >
                        {baseHotel.name.replace('Aank Hotel ', '').replace('酒店', '').slice(0, 4)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#636E72] mb-3 leading-relaxed">{day.note}</p>
                  {routeItems.length > 0 && (
                    <div className="rounded-lg border border-[#DFE6E9] bg-[#F5F7FA] p-2.5 space-y-1">
                      {routeItems}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-[#DFE6E9] bg-[#F5F7FA] text-xs shrink-0">
        <p className="text-[#636E72]">点击地点查看详情，点击交通详情查看换乘方案</p>
        <p className="text-[#B2BEC3] text-[10px] mt-1">地点详情包含地址、描述和备注，有交通的段落显示"交通详情"</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#DFE6E9] text-[10px] text-[#B2BEC3] text-center shrink-0">
        数据仅供参考 · 实际路线请以当地交通为准
      </div>
    </aside>
  )
}
