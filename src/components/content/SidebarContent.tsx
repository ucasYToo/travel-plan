import { useRef, useEffect } from 'react'
import type { ItineraryData, TransitDetail, LocationOrGroup, NoteItem } from '../../types'
import clsx from 'clsx'
import styles from './SidebarContent.module.css'
import { formatDate, getHotels, buildRouteItems } from './sidebarUtils.tsx'

export interface SidebarContentProps {
  data: ItineraryData
  activeDay: number | null
  onSelectDay: (index: number) => void
  onShowTransit?: (detail: TransitDetail) => void
  onShowLocationDetail?: (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => void
}

export function SidebarContent({ data, activeDay, onSelectDay, onShowTransit, onShowLocationDetail }: SidebarContentProps) {
  const hotels = getHotels(data.locations)
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (activeDay !== null) {
      const el = pillRefs.current[activeDay]
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ inline: 'center', behavior: 'smooth' })
      }
    }
  }, [activeDay])

  return (
    <>
      {/* === Magazine-style Header === */}
      <div className={styles.header}>
        {/* Decorative top line */}
        <div className={styles.headerDecoTop}>
          <svg className={styles.headerPetal} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <ellipse cx="8" cy="5" rx="3.5" ry="6" fill="#F4A4B8" opacity="0.35" transform="rotate(-15 8 5)" />
          </svg>
          <svg className={clsx(styles.headerPetal, styles.headerPetalR)} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <ellipse cx="8" cy="5" rx="3.5" ry="6" fill="#F4A4B8" opacity="0.25" transform="rotate(20 8 5)" />
          </svg>
          <svg className={clsx(styles.headerPetal, styles.headerPetalS)} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <ellipse cx="6" cy="4" rx="2.5" ry="4.5" fill="#A8D8F0" opacity="0.3" transform="rotate(-30 6 4)" />
          </svg>
        </div>

        <div className={styles.headerBody}>
          {data.metadata.cityLabel && (
            <div className={styles.titleKrRow}>
              <h1 className={styles.titleKr}>{data.metadata.cityLabel}</h1>
              <span className={styles.brandByline}>by trip-packer</span>
            </div>
          )}
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{data.metadata.title}</h2>
            {data.metadata.seasonLabel && <span className={styles.seasonBadge}>{data.metadata.seasonLabel}</span>}
          </div>
          <p className={styles.subtitle}>{data.metadata.subtitle}</p>
        </div>

        {/* Decorative bottom line */}
        <div className={styles.headerDecoLine} />
      </div>

      {/* === Scrollable Content === */}
      <div className={styles.scrollable}>
        {/* Hotels Info — compact */}
        {hotels.length > 0 && (
          <div className={styles.hotelRow}>
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className={styles.hotelChip}
                style={{ borderColor: `${hotel.color}40` }}
              >
                <div
                  className={styles.hotelChipIcon}
                  style={{ backgroundColor: hotel.color }}
                >
                  住
                </div>
                <p className={styles.hotelChipName}>{hotel.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Day Pills — horizontal scrolling */}
        <section>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIndicator} />
            {data.days.length} 日行程
          </h2>
          <div className={styles.dayPillBar}>
            {data.days.map((day, index) => {
              const isActive = activeDay === index
              const dateLabel = day.date ? formatDate(day.date) : `D${day.day}`
              return (
                <button
                  key={day.day}
                  type="button"
                  ref={(el) => { pillRefs.current[index] = el }}
                  onClick={() => onSelectDay(index)}
                  className={clsx(styles.dayPill, isActive && styles.dayPillActive)}
                  aria-selected={isActive}
                  style={isActive ? { animation: 'bloom 0.4s var(--ease-spring) both' } : undefined}
                >
                  <span className={styles.dayPillDay}>Day {day.day}</span>
                  <span className={styles.dayPillDate}>{dateLabel}</span>
                </button>
              )
            })}
          </div>

          {/* Route Timeline for active day */}
          {activeDay !== null && (
            <div className={styles.timelineContainer} key={activeDay}>
              {(() => {
                const day = data.days[activeDay]
                if (!day) return null
                const items = buildRouteItems(day, data, activeDay, onShowLocationDetail, onShowTransit)
                return (
                  <div className={styles.timeline}>
                    {items.map((item, i) => {
                      const isTransit = item.key?.toString().startsWith('transit-')
                      return (
                        <div
                          key={item.key ?? i}
                          className={clsx(isTransit ? styles.tlTransitSeg : styles.tlNodeWrap)}
                          style={{ '--stagger': i } as React.CSSProperties}
                        >
                          {item}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          {/* All days route summary (when no day selected) */}
          {activeDay === null && (
            <div className={styles.dayList}>
              {data.days.map((day, index) => {
                const baseHotel = data.locations[day.baseHotelId]
                const routeItems = buildRouteItems(day, data, index, onShowLocationDetail, onShowTransit)

                return (
                  <button
                    key={day.day}
                    type="button"
                    onClick={() => onSelectDay(index)}
                    className={clsx(styles.dayCard, activeDay === index && styles.dayCardActive)}
                  >
                    <div className={styles.dayHeader}>
                      <h3 className={clsx(styles.dayTitle, activeDay === index && styles.dayTitleActive)}>
                        Day {day.day} · {day.title}
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
                        <div className={styles.timeline}>
                          {routeItems.map((item) => {
                            const isTransit = item.key?.toString().startsWith('transit-')
                            return (
                              <div key={item.key ?? 'x'} className={clsx(isTransit ? styles.tlTransitSeg : styles.tlNodeWrap)}>
                                {item}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
