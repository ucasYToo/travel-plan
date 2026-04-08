import type { ItineraryData, LocationOrGroup, NoteItem, TransitDetail } from '../../types'
import { LocationDetailContent } from '../LocationDetailContent'
import styles from './DetailContent.module.css'

const MODE_ICON: Record<string, string> = {
  walk: '步',
  subway: '铁',
  bus: '巴',
  train: '列',
  taxi: '车',
  airport: '机'
}

const MODE_NAME: Record<string, string> = {
  walk: '步行',
  subway: '地铁',
  bus: '公交',
  train: '火车/铁路',
  taxi: '出租车',
  airport: '机场铁路'
}

export type DetailViewMode = 'none' | 'location' | 'transit'

export interface DetailContentProps {
  viewMode: DetailViewMode
  location: LocationOrGroup | null
  notes?: NoteItem[]
  data?: ItineraryData
  dayIndex?: number
  transitDetail?: TransitDetail | null
  onBack?: () => void
}

export function DetailContent({
  viewMode,
  location,
  notes,
  data,
  dayIndex,
  transitDetail,
  onBack,
}: DetailContentProps) {
  // Transit detail view
  if (viewMode === 'transit' && transitDetail) {
    return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={styles.backButton}
              aria-label="返回"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <h2 className={styles.title}>交通详情</h2>
        </div>

        {/* Badges */}
        <div className={styles.badges}>
          <span className={styles.badge}>{transitDetail.distance}</span>
          <span className={styles.badge}>{transitDetail.duration}</span>
          {transitDetail.fare && (
            <span className={styles.badge}>{transitDetail.fare}</span>
          )}
        </div>

        {/* Scrollable content */}
        <div className={styles.content}>
          <div className={styles.routeSummary}>
            <span className="font-semibold">{transitDetail.startName}</span>
            <span className="text-[var(--mist)]">→</span>
            <span className="font-semibold">{transitDetail.endName}</span>
          </div>

          <div className={styles.timeline}>
            {transitDetail.steps.map((step, idx) => (
              <div key={idx} className={styles.timelineStep}>
                <div className={styles.timelineDot}>
                  {MODE_ICON[step.mode] || '交'}
                </div>
                <div className={styles.stepBody}>
                  <div className={styles.stepMeta}>
                    <span>{MODE_NAME[step.mode] || step.mode}</span>
                    {step.line && <span className="text-[var(--mist)]">· {step.line}</span>}
                  </div>
                  <p className={styles.stepInstruction}>{step.instruction}</p>
                  <div className={styles.stepDetail}>
                    <span>{step.duration}</span>
                    {step.distance && <span>· {step.distance}</span>}
                    <span className="text-[var(--mist)]">·</span>
                    <span>{step.from} → {step.to}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          数据仅供参考 · 实际路线请以当地交通为准
        </div>
      </div>
    )
  }

  // Location detail view
  if (viewMode === 'location' && location) {
    const typeLabel =
      location.type === 'hotel_group'
        ? '住宿地点'
        : location.type === 'group'
          ? '商圈 / 景点组'
          : '景点'

    return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.locationHeader}>
          <div className={styles.locationTitleRow}>
            <span className={styles.locationColorDot} style={{ backgroundColor: location.color }} />
            <h2 className={styles.locationName}>{location.name}</h2>
          </div>
          <p className={styles.locationType}>{typeLabel}</p>
        </div>

        {/* Scrollable content */}
        <div className={styles.scrollable}>
          <LocationDetailContent location={location} notes={notes} data={data} dayIndex={dayIndex} />
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          数据仅供参考 · 实际信息请以现场为准
        </div>
      </div>
    )
  }

  // Empty state
  const emptyTitle = data?.metadata.title
    ? `探索${data.metadata.title.replace(/(?:旅行|攻略|之旅).*$/, '')}`
    : '探索城市'

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyContent}>
        <p className={styles.emptyTitle}>{emptyTitle}</p>
        <p className={styles.emptyHint}>点击地图标记或行程卡片，查看每处风景的故事与细节</p>
      </div>
    </div>
  )
}
