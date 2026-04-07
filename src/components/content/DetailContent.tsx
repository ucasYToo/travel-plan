import type { ItineraryData, LocationOrGroup, NoteItem, TransitDetail } from '../../types'
import { LocationDetailContent } from '../LocationDetailContent'

const MODE_ICON: Record<string, string> = {
  walk: '🚶',
  subway: '🚇',
  bus: '🚌',
  train: '🚆',
  taxi: '🚕',
  airport: '✈️'
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
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#DFE6E9] bg-white shrink-0 flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#DCFAED] transition text-[#2D3436]"
              aria-label="返回"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <h2 className="text-base font-bold text-[#2D3436] flex-1">交通详情</h2>
        </div>

        {/* Badges */}
        <div className="px-4 py-2 flex items-center gap-2 text-xs shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-[#DCFAED] text-[#2D3436] font-medium">{transitDetail.distance}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#DCFAED] text-[#2D3436] font-medium">{transitDetail.duration}</span>
          {transitDetail.fare && (
            <span className="px-2 py-0.5 rounded-full bg-[#DCFAED] text-[#2D3436] font-medium">{transitDetail.fare}</span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#2D3436]">
            <span className="font-semibold">{transitDetail.startName}</span>
            <span className="text-[#B2BEC3]">→</span>
            <span className="font-semibold">{transitDetail.endName}</span>
          </div>

          <div className="relative pl-3 border-l-2 border-[#DCFAED] space-y-4">
            {transitDetail.steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[19px] top-0 w-5 h-5 rounded-full bg-[#DCFAED] border border-[#A8E6CF] flex items-center justify-center text-[10px]">
                  {MODE_ICON[step.mode] || '🚶'}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#636E72]">
                    <span>{MODE_NAME[step.mode] || step.mode}</span>
                    {step.line && <span className="text-[#B2BEC3]">· {step.line}</span>}
                  </div>
                  <p className="text-sm text-[#2D3436] mt-0.5 leading-relaxed">{step.instruction}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#636E72]">
                    <span>{step.duration}</span>
                    {step.distance && <span>· {step.distance}</span>}
                    <span className="text-[#B2BEC3]">·</span>
                    <span>{step.from} → {step.to}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#DFE6E9] bg-[#F5F7FA] text-center text-[10px] text-[#B2BEC3] shrink-0">
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
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#DFE6E9] bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: location.color }} />
            <h2 className="text-[#2D3436] font-bold text-lg">{location.name}</h2>
          </div>
          <p className="text-xs text-[#636E72] mt-0.5">{typeLabel}</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <LocationDetailContent location={location} notes={notes} data={data} dayIndex={dayIndex} />
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#DFE6E9] bg-[#F5F7FA] text-center text-[10px] text-[#B2BEC3] shrink-0">
          数据仅供参考 · 实际信息请以现场为准
        </div>
      </div>
    )
  }

  // Empty state
  return (
    <div className="flex items-center justify-center h-full p-6 text-center">
      <div>
        <p className="text-[#2D3436] text-lg">&#127793; 点击地图或行程查看详情 &#127793;</p>
        <p className="text-[#636E72] text-sm mt-2">探索首尔的春天美景</p>
      </div>
    </div>
  )
}
