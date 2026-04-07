import type { ItineraryData, Location, LocationOrGroup, NoteItem, NoteCategory } from '../types'
import styles from './LocationDetailContent.module.css'

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
    <div className={styles.notesWrapper}>
      {categories.map((category) => (
        <div key={category} className={styles.noteCategory}>
          <div className={styles.noteCategoryHeader}>
            <span className={styles.noteBadge}>
              {CATEGORY_ICON[category]}
            </span>
            <span>{CATEGORY_NAME[category]}</span>
          </div>
          <div>
            {grouped[category].map((note, idx) => (
              <div key={idx} className={styles.noteCategoryItem}>
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
    <div className={styles.container}>
      {/* Description */}
      {hasDescription && (
        <div>
          <h3 className={styles.sectionTitle}>描述</h3>
          <p className={styles.textBody}>{location.description}</p>
        </div>
      )}

      {/* Address */}
      {hasAddress && (
        <div>
          <h3 className={styles.sectionTitle}>地址</h3>
          <div className={styles.addressBox}>
            <p className={styles.addressText}>{location.address}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(location.address!)
                  .then(() => alert('地址已复制'))
                  .catch(() => alert('复制失败，请手动复制'))
              }}
              className={styles.copyButton}
            >
              复制
            </button>
          </div>
        </div>
      )}

      {/* Notes (for spot/hotel direct notes) */}
      {hasNotes && categories.length > 0 && (
        <div className={styles.notesSection}>
          <h3 className={styles.notesTitle}>备注</h3>
          <div className={styles.container}>
            {categories.map((category) => (
              <div key={category} className={styles.noteGroup}>
                <div className={styles.noteGroupHeader}>
                  <span className={styles.noteBadge}>
                    {CATEGORY_ICON[category]}
                  </span>
                  <span>{CATEGORY_NAME[category]}</span>
                </div>
                <div>
                  {groupedNotes![category].map((note, idx) => (
                    <div
                      key={idx}
                      className={styles.noteItem}
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
        <div className={styles.spotsSection}>
          <h3 className={styles.spotsTitle}>
            {location.type === 'hotel_group' ? '周边地点' : '商圈地点'}
          </h3>
          <div className={styles.container}>
            {childrenSpots.map((spot) => {
              const spotNotes = dayIndex !== undefined && data
                ? getNotesForLocation(spot.id, data, dayIndex)
                : []
              return (
                <div key={spot.id} className={styles.spotCard}>
                  <div className={styles.spotHeader}>
                    <span className={styles.spotDot} style={{ backgroundColor: spot.color }} />
                    <span className={styles.spotName}>{spot.name}</span>
                  </div>
                  {spot.address && (
                    <p className={styles.spotAddress}>{spot.address}</p>
                  )}
                  {spot.description && (
                    <p className={styles.spotDescription}>{spot.description}</p>
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
