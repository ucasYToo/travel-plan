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

export interface LocationDetailModalProps {
  open: boolean
  onClose: () => void
  location: LocationOrGroup | null
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
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <span>{CATEGORY_ICON[category]}</span>
            <span>{CATEGORY_NAME[category]}</span>
          </div>
          <div className="space-y-1">
            {grouped[category].map((note, idx) => (
              <div
                key={idx}
                className="pl-3 py-1 border-l-2 border-gray-200 text-xs text-gray-700 leading-relaxed"
              >
                {note.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function LocationDetailModal({ open, onClose, location, notes, data, dayIndex }: LocationDetailModalProps): JSX.Element | null {
  if (!open || !location) return null

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[80dvh] sm:max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-violet-500 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">地点详情</h2>
            <button
              type="button"
              onClick={onClose}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white text-sm"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: location.color }} />
            <p className="text-sm opacity-90 truncate">{location.name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 py-4 space-y-4">
          {/* Description */}
          {hasDescription && (
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-1">描述</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{location.description}</p>
            </div>
          )}

          {/* Address */}
          {hasAddress && (
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-1">地址</h3>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-mono flex-1 break-all">{location.address}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(location.address!)
                      .then(() => alert('地址已复制！'))
                      .catch(() => alert('复制失败，请手动复制'))
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition shrink-0"
                >
                  复制
                </button>
              </div>
            </div>
          )}

          {/* Notes (for spot/hotel direct notes) */}
          {hasNotes && categories.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-medium text-gray-400 mb-3">备注</h3>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span>{CATEGORY_ICON[category]}</span>
                      <span>{CATEGORY_NAME[category]}</span>
                    </div>
                    <div className="space-y-2">
                      {groupedNotes![category].map((note, idx) => (
                        <div
                          key={idx}
                          className="pl-4 py-2 border-l-2 border-gray-200 text-sm text-gray-700 leading-relaxed"
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
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-medium text-gray-400 mb-3">
                {location.type === 'hotel_group' ? '周边地点' : '商圈地点'}
              </h3>
              <div className="space-y-3">
                {childrenSpots.map((spot) => {
                  const spotNotes = dayIndex !== undefined && data
                    ? getNotesForLocation(spot.id, data, dayIndex)
                    : []
                  return (
                    <div key={spot.id} className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spot.color }} />
                        <span className="text-sm font-medium text-gray-900">{spot.name}</span>
                      </div>
                      {spot.address && (
                        <p className="text-[10px] text-gray-500 font-mono mb-1 truncate">{spot.address}</p>
                      )}
                      {spot.description && (
                        <p className="text-xs text-gray-600 leading-relaxed">{spot.description}</p>
                      )}
                      {renderNotesSection(spotNotes)}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
