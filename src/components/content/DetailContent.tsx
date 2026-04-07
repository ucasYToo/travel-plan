import type { ItineraryData, LocationOrGroup, NoteItem, TransitDetail } from '../../types'
import { LocationDetailContent } from '../LocationDetailContent'

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
      <div className="flex flex-col h-full bg-[var(--bg-main)]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-spring)] bg-[var(--bg-card)] shrink-0 flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border-spring)] text-[var(--stone)] hover:text-[var(--ink)] hover:border-[var(--sakura-pink)] transition"
              aria-label="返回"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <h2 className="text-base font-semibold text-[var(--ink)] flex-1 font-display tracking-tight">交通详情</h2>
        </div>

        {/* Badges */}
        <div className="px-5 py-3 flex items-center gap-2 text-xs shrink-0 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-[var(--bud-pale)] text-[var(--bud-deep)] font-medium border border-[var(--bud-green)]/20">{transitDetail.distance}</span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--bud-pale)] text-[var(--bud-deep)] font-medium border border-[var(--bud-green)]/20">{transitDetail.duration}</span>
          {transitDetail.fare && (
            <span className="px-2.5 py-1 rounded-full bg-[var(--bud-pale)] text-[var(--bud-deep)] font-medium border border-[var(--bud-green)]/20">{transitDetail.fare}</span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <span className="font-semibold">{transitDetail.startName}</span>
            <span className="text-[var(--mist)]">→</span>
            <span className="font-semibold">{transitDetail.endName}</span>
          </div>

          <div className="relative pl-4 border-l-2 border-[var(--border-spring)] space-y-5">
            {transitDetail.steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-0 w-6 h-6 rounded-full bg-[var(--bg-card)] border-2 border-[var(--border-spring)] flex items-center justify-center text-[10px] font-semibold text-[var(--stone)]">
                  {MODE_ICON[step.mode] || '交'}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--stone)]">
                    <span>{MODE_NAME[step.mode] || step.mode}</span>
                    {step.line && <span className="text-[var(--mist)]">· {step.line}</span>}
                  </div>
                  <p className="text-sm text-[var(--ink)] mt-1 leading-relaxed">{step.instruction}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[var(--stone)]">
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
        <div className="px-5 py-3 border-t border-[var(--border-spring)] bg-[var(--bg-card)] text-center text-[10px] text-[var(--stone-light)] shrink-0">
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
      <div className="flex flex-col h-full bg-[var(--bg-main)]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-spring)] bg-[var(--bg-card)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: location.color }} />
            <h2 className="text-[var(--ink)] font-display font-semibold text-xl tracking-tight">{location.name}</h2>
          </div>
          <p className="text-[10px] text-[var(--stone)] mt-1 font-medium tracking-wide uppercase">{typeLabel}</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <LocationDetailContent location={location} notes={notes} data={data} dayIndex={dayIndex} />
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-[var(--border-spring)] bg-[var(--bg-card)] text-center text-[10px] text-[var(--stone-light)] shrink-0">
          数据仅供参考 · 实际信息请以现场为准
        </div>
      </div>
    )
  }

  // Empty state
  return (
    <div className="flex items-center justify-center h-full p-6 text-center">
      <div className="max-w-xs">
        <p className="font-display text-2xl text-[var(--ink)] mb-2">探索首尔</p>
        <p className="text-[var(--stone)] text-sm leading-relaxed">点击地图标记或行程卡片，查看每处风景的故事与细节</p>
      </div>
    </div>
  )
}
