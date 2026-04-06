import type { ItineraryData, Location, LocationOrGroup, NoteItem, NoteCategory } from '../types'

const CATEGORY_ICON: Record<NoteCategory, string> = {
  food: '🍽️',
  shopping: '🛍️',
  tips: '💡',
  other: '📝'
}

const CATEGORY_NAME: Record<NoteCategory, string> = {
  food: '吃什么',
  shopping: '买什么',
  tips: '注意事项',
  other: '备注'
}

export interface LocationDetailContentProps {
  location: LocationOrGroup
  notes?: NoteItem[]
  data?: ItineraryData
  dayIndex?: number
}

function getNotesForLocation(locationId: string, data: ItineraryData, dayIndex: number): NoteItem[] {
  const day = data.days[dayIndex]
  if (!day) return []
  return day.path
    .filter(p => p.locationId === locationId && p.notes && p.notes.length > 0)
    .flatMap(p => p.notes!)
}

function renderNotesSection(notes: NoteItem[]) {
  const grouped = notes.reduce<Record<NoteCategory, NoteItem[]>>((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = []
    }
    acc[note.category].push(note)
    return acc
  }, { food: [], shopping: [], tips: [], other: [] })

  const categories = (Object.keys(grouped) as NoteCategory[]).filter(cat => grouped[cat].length > 0)
  if (categories.length === 0) return null

  return (
    <div className="space-y-3 mt-2">
      {categories.map((category) => (
        <div key={category} className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#636E72]">
            <span>{CATEGORY_ICON[category]}</span>
            <span>{CATEGORY_NAME[category]}</span>
          </div>
          <div className="space-y-1">
            {grouped[category].map((note, idx) => (
              <div key={idx} className="pl-3 py-1 border-l-2 border-[#A8E6CF] text-xs text-[#2D3436] leading-relaxed">
                {note.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function LocationDetailContent({ location, notes, data, dayIndex }: LocationDetailContentProps): JSX.Element {
  const hasAddress = 'address' in location && location.address
  const hasDescription = location.description && location.description.trim().length > 0
  const hasNotes = notes && notes.length > 0

  const isGroup = location.type === 'group' || location.type === 'hotel_group'
  const childrenSpots: Location[] = isGroup && data
    ? location.children
        .map(id => data.locations[id])
        .filter((loc): loc is Location => loc?.type === 'spot')
    : []

  const groupedNotes = hasNotes
    ? notes!.reduce<Record<NoteCategory, NoteItem[]>>((acc, note) => {
        if (!acc[note.category]) {
          acc[note.category] = []
        }
        acc[note.category].push(note)
        return acc
      }, { food: [], shopping: [], tips: [], other: [] })
    : null

  const categories = groupedNotes
    ? (Object.keys(groupedNotes) as NoteCategory[]).filter(cat => groupedNotes[cat].length > 0)
    : []

  return (
    <div className="space-y-4">
      {/* Description */}
      {hasDescription && (
        <div>
          <h3 className="text-xs font-medium text-[#B2BEC3] mb-1">描述</h3>
          <p className="text-sm text-[#2D3436] leading-relaxed">{location.description}</p>
        </div>
      )}

      {/* Address */}
      {hasAddress && (
        <div>
          <h3 className="text-xs font-medium text-[#B2BEC3] mb-1">地址</h3>
          <div className="flex items-center gap-2 p-2 bg-[#F5F7FA] rounded-[12px]">
            <p className="text-sm text-[#2D3436] font-mono flex-1 break-all">{location.address}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(location.address!)
                  .then(() => alert('地址已复制！'))
                  .catch(() => alert('复制失败，请手动复制'))
              }}
              className="px-2 py-1 text-xs bg-[#A8E6CF] text-[#2D3436] rounded-[8px] hover:bg-[#88D8B0] transition shrink-0 font-medium"
            >
              复制
            </button>
          </div>
        </div>
      )}

      {/* Notes (for spot/hotel direct notes) */}
      {hasNotes && categories.length > 0 && (
        <div className="border-t border-[#DFE6E9] pt-4">
          <h3 className="text-xs font-medium text-[#B2BEC3] mb-3">备注</h3>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[#2D3436]">
                  <span>{CATEGORY_ICON[category]}</span>
                  <span>{CATEGORY_NAME[category]}</span>
                </div>
                <div className="space-y-2">
                  {groupedNotes![category].map((note, idx) => (
                    <div
                      key={idx}
                      className="pl-4 py-2 border-l-2 border-[#A8E6CF] text-sm text-[#2D3436] leading-relaxed"
                    >
                      {note.content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Children spots for group/hotel_group */}
      {childrenSpots.length > 0 && (
        <div className="border-t border-[#DFE6E9] pt-4">
          <h3 className="text-xs font-medium text-[#B2BEC3] mb-3">
            {location.type === 'hotel_group' ? '周边地点' : '商圈地点'}
          </h3>
          <div className="space-y-3">
            {childrenSpots.map((spot) => {
              const spotNotes = dayIndex !== undefined && data
                ? getNotesForLocation(spot.id, data, dayIndex)
                : []
              return (
                <div key={spot.id} className="p-2.5 rounded-[12px] bg-[#F5F7FA] border border-[#DFE6E9]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spot.color }} />
                    <span className="text-sm font-medium text-[#2D3436]">{spot.name}</span>
                  </div>
                  {spot.address && (
                    <p className="text-[10px] text-[#636E72] font-mono mb-1 truncate">{spot.address}</p>
                  )}
                  {spot.description && (
                    <p className="text-xs text-[#636E72] leading-relaxed">{spot.description}</p>
                  )}
                  {renderNotesSection(spotNotes)}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
