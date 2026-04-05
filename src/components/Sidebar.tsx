import type { ItineraryData, TransitDetail, DayPlan, LocationOrGroup } from '../types'

export interface SidebarProps {
  data: ItineraryData
  activeDay: number | null
  onSelectDay: (index: number) => void
  isOpen: boolean
  onShowTransit?: (detail: TransitDetail) => void
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

// Type guard to check if location is a group
function isLocationGroup(loc: LocationOrGroup): loc is LocationOrGroup & { type: 'group' | 'hotel_group' } {
  return loc.type === 'group' || loc.type === 'hotel_group'
}

export function Sidebar({ data, activeDay, onSelectDay, isOpen, onShowTransit }: SidebarProps): JSX.Element {
  const hotels = getHotels(data.locations)

  return (
    <aside
      className={`sidebar-panel absolute left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur shadow-xl z-10 flex flex-col transition-transform duration-300 sm:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-violet-500 text-white shrink-0">
        <h1 className="text-lg font-bold">{data.metadata.title}</h1>
        <p className="text-xs opacity-90 mt-1">{data.metadata.subtitle}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-5">
        {/* Hotels Info */}
        {hotels.length > 0 && (
          <div className={`grid gap-2 ${hotels.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="p-2 rounded-lg border"
                style={{ backgroundColor: `${hotel.color}15`, borderColor: `${hotel.color}30` }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: hotel.color }}
                  >
                    住
                  </div>
                  <p className="font-bold text-gray-900 text-xs truncate">{hotel.name}</p>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">{hotel.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Itinerary Section */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
            {data.days.length}日行程规划
          </h2>
          <div className="space-y-2">
            {data.days.map((day, index) => {
              const baseHotel = data.locations[day.baseHotelId]
              const pathWithLocations = getPathLocations(day, data.locations)

              // Group consecutive points by location type for display
              // Day 0 starts from airport (first point has transit), Day 1+ skip start hotel
              const startIndex = day.day === 0 ? 0 : 1

              // Track order for groups (ABC) and spots (123)
              let groupIdx = 0
              let spotIdx = 1
              const groupBadges: Record<string, string> = {}
              const spotBadges: Record<string, string> = {}

              // First pass: assign badges
              pathWithLocations.slice(startIndex).forEach(({ location }) => {
                if (isLocationGroup(location)) {
                  if (!groupBadges[location.id]) {
                    groupBadges[location.id] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[groupIdx++] || ''
                  }
                } else {
                  if (!spotBadges[location.id]) {
                    spotBadges[location.id] = String(spotIdx++)
                  }
                }
              })

              const routeSegments = pathWithLocations
                .slice(startIndex)
                .map(({ point, location }, idx) => {
                  const clickable = !!point.transit
                  const isGroup = isLocationGroup(location)
                  const badge = isGroup ? groupBadges[location.id] : spotBadges[location.id]

                  return (
                    <div
                      key={idx}
                      className={[
                        'flex items-center gap-2 rounded px-1.5 py-1 -mx-1 transition',
                        isGroup ? 'text-xs text-gray-900 font-medium bg-white border border-gray-200' : 'text-[10px] text-gray-600 ml-4',
                        clickable ? 'cursor-pointer hover:bg-gray-100' : ''
                      ].join(' ')}
                      onClick={clickable && onShowTransit ? () => onShowTransit(point.transit!) : undefined}
                    >
                      <span
                        className={`rounded-full shrink-0 flex items-center justify-center text-white ${isGroup ? 'w-5 h-5 text-[10px]' : 'w-4 h-4 text-[8px]'}`}
                        style={{ background: location.color }}
                      >
                        {badge || (isGroup ? '●' : '•')}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span>{location.name}</span>
                        {point.label && point.label !== '起点' && point.label !== '起点（搬家日）' && (
                          <span className="text-gray-400"> · {point.label}</span>
                        )}
                      </span>
                      {clickable ? (
                        <span className="ml-auto text-[10px] text-blue-500 shrink-0">查看详情</span>
                      ) : null}
                    </div>
                  )
                })

              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => onSelectDay(index)}
                  className={[
                    'day-card w-full text-left p-4 rounded-xl border transition-all cursor-pointer shadow-sm',
                    'hover:border-gray-300 hover:shadow-md',
                    activeDay === index ? 'border-blue-400 bg-blue-50/80' : 'border-gray-100 bg-white'
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-gray-900 text-sm">{day.title}</h3>
                    {baseHotel && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium whitespace-nowrap shrink-0 ml-2"
                        style={{ backgroundColor: baseHotel.color }}
                      >
                        {baseHotel.name.replace('Aank Hotel ', '').replace('酒店', '').slice(0, 4)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{day.note}</p>
                  {routeSegments.length > 0 && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5 space-y-1">
                      {routeSegments}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/80 text-xs shrink-0">
        <p className="text-gray-500">点击上方行程卡片，查看当日路线与交通时间</p>
        <p className="text-gray-400 text-[10px] mt-1">点击"查看详情"可展开完整换乘方案</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400 text-center shrink-0">
        数据仅供参考 · 实际路线请以当地交通为准
      </div>
    </aside>
  )
}
