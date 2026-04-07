import type { ItineraryData, Location, LocationOrGroup, NoteItem, NoteCategory } from '../types'

const CATEGORY_ICON: Record<NoteCategory, string> = {
  food: '食',
  shopping: '购',
  tips: '注',
  other: '记'
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
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[var(--stone)] tracking-wide uppercase">
            <span className="w-5 h-5 rounded-full bg-[var(--bg-card)] border border-[var(--border-spring)] flex items-center justify-center text-[10px]">
              {CATEGORY_ICON[category]}
            </span>
            <span>{CATEGORY_NAME[category]}</span>
          </div>
          <div className="space-y-1">
            {grouped[category].map((note, idx) => (
              <div key={idx} className="pl-3 py-1 border-l-2 border-[var(--sakura-pink)]/40 text-xs text-[var(--ink-light)] leading-relaxed">
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
    <div className="space-y-5">
      {/* Description */}
      {hasDescription && (
        <div>
          <h3 className="text-[10px] font-semibold text-[var(--stone)] mb-1.5 tracking-wide uppercase">描述</h3>
          <p className="text-sm text-[var(--ink-light)] leading-relaxed">{location.description}</p>
        </div>
      )}

      {/* Address */}
      {hasAddress && (
        <div>
          <h3 className="text-[10px] font-semibold text-[var(--stone)] mb-1.5 tracking-wide uppercase">地址</h3>
          <div className="flex items-center gap-2 p-3 bg-[var(--bg-card)] border border-[var(--border-spring)] rounded-xl">
            <p className="text-sm text-[var(--ink)] font-mono flex-1 break-all leading-snug">{location.address}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(location.address!)
                  .then(() => alert('地址已复制'))
                  .catch(() => alert('复制失败，请手动复制'))
              }}
              className="px-3 py-1.5 text-[11px] bg-[var(--bud-green)] text-white rounded-lg hover:bg-[var(--bud-deep)] transition shrink-0 font-medium"
            >
              复制
            </button>
          </div>
        </div>
      )}

      {/* Notes (for spot/hotel direct notes) */}
      {hasNotes && categories.length > 0 && (
        <div className="border-t border-[var(--border-spring)] pt-4">
          <h3 className="text-[10px] font-semibold text-[var(--stone)] mb-3 tracking-wide uppercase">备注</h3>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                  <span className="w-5 h-5 rounded-full bg-[var(--bg-card)] border border-[var(--border-spring)] flex items-center justify-center text-[10px]">
                    {CATEGORY_ICON[category]}
                  </span>
                  <span>{CATEGORY_NAME[category]}</span>
                </div>
                <div className="space-y-2">
                  {groupedNotes![category].map((note, idx) => (
                    <div
                      key={idx}
                      className="pl-4 py-2 border-l-2 border-[var(--sakura-pink)]/40 text-sm text-[var(--ink-light)] leading-relaxed"
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
        <div className="border-t border-[var(--border-spring)] pt-4">
          <h3 className="text-[10px] font-semibold text-[var(--stone)] mb-3 tracking-wide uppercase">
            {location.type === 'hotel_group' ? '周边地点' : '商圈地点'}
          </h3>
          <div className="space-y-3">
            {childrenSpots.map((spot) => {
              const spotNotes = dayIndex !== undefined && data
                ? getNotesForLocation(spot.id, data, dayIndex)
                : []
              return (
                <div key={spot.id} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-spring)] transition hover:shadow-spring">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spot.color }} />
                    <span className="text-sm font-semibold text-[var(--ink)]">{spot.name}</span>
                  </div>
                  {spot.address && (
                    <p className="text-[10px] text-[var(--stone)] font-mono mb-1 truncate">{spot.address}</p>
                  )}
                  {spot.description && (
                    <p className="text-xs text-[var(--stone)] leading-relaxed">{spot.description}</p>
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
