import type { TransitDetail } from '../types'

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

export interface TransportModalProps {
  open: boolean
  onClose: () => void
  detail: TransitDetail | null
}

export function TransportModal({ open, onClose, detail }: TransportModalProps): JSX.Element | null {
  if (!open || !detail) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[80dvh] sm:max-h-[85vh] overflow-y-auto bg-white rounded-[20px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-[#DFE6E9] bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2D3436]">交通详情</h2>
            <button
              type="button"
              onClick={onClose}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#DCFAED] transition text-[#2D3436] text-sm"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-[#DCFAED] text-[#2D3436] font-medium">{detail.distance}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#DCFAED] text-[#2D3436] font-medium">{detail.duration}</span>
            {detail.fare ? (
              <span className="px-2 py-0.5 rounded-full bg-[#DCFAED] text-[#2D3436] font-medium">{detail.fare}</span>
            ) : null}
          </div>
        </div>

        {/* Steps */}
        <div className="px-4 sm:px-5 py-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#2D3436]">
            <span className="font-semibold">{detail.startName}</span>
            <span className="text-[#B2BEC3]">→</span>
            <span className="font-semibold">{detail.endName}</span>
          </div>

          <div className="relative pl-3 border-l-2 border-[#DCFAED] space-y-4">
            {detail.steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[19px] top-0 w-5 h-5 rounded-full bg-[#DCFAED] border border-[#A8E6CF] flex items-center justify-center text-[10px]">
                  {MODE_ICON[step.mode] || '🚶'}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#636E72]">
                    <span>{MODE_NAME[step.mode] || step.mode}</span>
                    {step.line ? <span className="text-[#B2BEC3]">· {step.line}</span> : null}
                  </div>
                  <p className="text-sm text-[#2D3436] mt-0.5 leading-relaxed">{step.instruction}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#636E72]">
                    <span>{step.duration}</span>
                    {step.distance ? <span>· {step.distance}</span> : null}
                    <span className="text-[#B2BEC3]">·</span>
                    <span>
                      {step.from} → {step.to}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#DFE6E9] bg-[#F5F7FA] text-center sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#A8E6CF] text-[#2D3436] text-sm font-medium rounded-[14px] hover:bg-[#88D8B0] transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
