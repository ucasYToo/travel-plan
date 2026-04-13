import { getDayGroups } from './exportMapUtils'
import type { ItineraryData } from '../../types'
import styles from './ExportMapOverlay.module.css'

interface ExportMapOverlayProps {
  data: ItineraryData
  activeDay: number | null
}

export function ExportMapOverlay({ data, activeDay }: ExportMapOverlayProps) {
  if (activeDay !== null) {
    const day = data.days[activeDay]
    if (!day) return null
    const groups = getDayGroups(day, data)
    return (
      <div className={styles.overlay}>
        <div className={styles.dayCard}>
          <div className={styles.dayCardHeader}>
            <span className={styles.dayCardLabel}>Day {day.day}</span>
            <span className={styles.dayCardTitle}>{day.title}</span>
            {day.date && <span className={styles.dayCardDate}>{day.date}</span>}
          </div>
          <div className={styles.dayCardGroups}>
            {groups.map((g) => (
              <span key={g.id} className={styles.groupChip} style={{ background: g.color }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Panorama: all days summary (groups only)
  return (
    <div className={styles.overlay}>
      <div className={styles.panoDays}>
        {data.days.map((day) => {
          const groups = getDayGroups(day, data)
          return (
            <div key={day.day} className={styles.panoDayCard}>
              <div className={styles.panoDayHeader}>
                <span className={styles.panoDayLabel}>Day {day.day}</span>
                <span className={styles.panoDayTitle}>{day.title}</span>
              </div>
              <div className={styles.panoGroups}>
                {groups.slice(0, 4).map((g) => (
                  <span key={g.id} className={styles.panoGroupName} style={{ color: g.color }}>
                    {g.name}
                  </span>
                ))}
                {groups.length > 4 && (
                  <span className={styles.panoMore}>+{groups.length - 4}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
