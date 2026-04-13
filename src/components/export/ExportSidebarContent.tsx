import type { ItineraryData, DayPlan } from '../../types'
import clsx from 'clsx'
import sidebarStyles from '../content/SidebarContent.module.css'
import styles from './ExportSidebarContent.module.css'
import { formatDate, getHotels, buildRouteItems } from '../content/sidebarUtils.tsx'

interface ExportSidebarContentProps {
  data: ItineraryData
  activeDay?: number | null
  variant?: 'default' | 'dayHorizontal'
}

function DayRouteCard({
  day,
  data,
  dayIndex,
  compact = false,
}: {
  day: DayPlan
  data: ItineraryData
  dayIndex: number
  compact?: boolean
}) {
  const items = buildRouteItems(day, data, dayIndex)
  const baseHotel = data.locations[day.baseHotelId]

  const content = (
    <>
      <div className={sidebarStyles.dayHeader}>
        <h3 className={clsx(sidebarStyles.dayTitle, styles.dayTitleFix)}>
          Day {day.day} · {day.title}&nbsp;
        </h3>
        {day.date && <span className={styles.dateLabel}>{formatDate(day.date)}</span>}
        {baseHotel && (
          <span className={sidebarStyles.badgePill} style={{ backgroundColor: baseHotel.color }}>
            {baseHotel.name.replace('Aank Hotel ', '').replace('酒店', '').slice(0, 4)}
          </span>
        )}
      </div>
      {!compact && <p className={sidebarStyles.dayNote}>{day.note}</p>}
      {items.length > 0 && (
        <div className={sidebarStyles.routeBox}>
          <div className={sidebarStyles.timeline}>
            {items.map((item, i) => {
              const isTransit = item.key?.toString().startsWith('transit-')
              return (
                <div
                  key={item.key ?? i}
                  className={clsx(isTransit ? sidebarStyles.tlTransitSeg : sidebarStyles.tlNodeWrap)}
                  style={{ '--stagger': i } as React.CSSProperties}
                >
                  {item}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )

  if (compact) {
    return <div className={styles.dayRouteCompact}>{content}</div>
  }
  return <div className={sidebarStyles.dayCard}>{content}</div>
}

export function ExportSidebarContent({ data, activeDay, variant = 'default' }: ExportSidebarContentProps) {
  const hotels = getHotels(data.locations)
  const isSingleDay = activeDay != null
  const isCompact = variant === 'dayHorizontal'

  return (
    <div className={styles.container}>
      {/* Header — only for multi-day vertical (itinerary-vertical) */}
      {!isCompact && !isSingleDay && (
        <div className={sidebarStyles.header}>
          <div className={sidebarStyles.headerDecoTop}>
            <svg className={sidebarStyles.headerPetal} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <ellipse cx="8" cy="5" rx="3.5" ry="6" fill="#F4A4B8" opacity="0.35" transform="rotate(-15 8 5)" />
            </svg>
            <svg className={clsx(sidebarStyles.headerPetal, sidebarStyles.headerPetalR)} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <ellipse cx="8" cy="5" rx="3.5" ry="6" fill="#F4A4B8" opacity="0.25" transform="rotate(20 8 5)" />
            </svg>
            <svg className={clsx(sidebarStyles.headerPetal, sidebarStyles.headerPetalS)} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <ellipse cx="6" cy="4" rx="2.5" ry="4.5" fill="#A8D8F0" opacity="0.3" transform="rotate(-30 6 4)" />
            </svg>
          </div>
          <div className={sidebarStyles.headerBody}>
            {data.metadata.cityLabel && <h1 className={sidebarStyles.titleKr}>{data.metadata.cityLabel}</h1>}
            <div className={sidebarStyles.titleRow}>
              <h2 className={sidebarStyles.title}>{data.metadata.title}</h2>
              {data.metadata.seasonLabel && <span className={sidebarStyles.seasonBadge}>{data.metadata.seasonLabel}</span>}
            </div>
            <p className={sidebarStyles.subtitle}>{data.metadata.subtitle}</p>
          </div>
          <div className={sidebarStyles.headerDecoLine} />
        </div>
      )}

      {/* Scrollable Content */}
      <div className={sidebarStyles.scrollable}>
        {/* Hotels — only for multi-day vertical */}
        {!isCompact && !isSingleDay && hotels.length > 0 && (
          <div className={sidebarStyles.hotelRow}>
            {hotels.map((hotel) => (
              <div key={hotel.id} className={sidebarStyles.hotelChip} style={{ borderColor: `${hotel.color}40` }}>
                <div className={sidebarStyles.hotelChipIcon} style={{ backgroundColor: hotel.color }}>住</div>
                <p className={sidebarStyles.hotelChipName}>{hotel.name}</p>
              </div>
            ))}
          </div>
        )}

        <section>
          {/* Section title — only for multi-day vertical */}
          {!isCompact && !isSingleDay && (
            <h2 className={sidebarStyles.sectionTitle}>
              <span className={sidebarStyles.sectionIndicator} />
              {data.days.length} 日行程
            </h2>
          )}

          {isSingleDay ? (
            activeDay != null && (
              <DayRouteCard day={data.days[activeDay]} data={data} dayIndex={activeDay} compact={isCompact} />
            )
          ) : (
            /* All days cards */
            <div className={sidebarStyles.dayList}>
              {data.days.map((day, index) => (
                <DayRouteCard key={day.day} day={day} data={data} dayIndex={index} compact={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
