import type { ItineraryData, LocationOrGroup, NoteItem } from '../types'
import { LocationDetailContent } from './LocationDetailContent'

export interface LocationDetailModalProps {
  open: boolean
  onClose: () => void
  location: LocationOrGroup | null
  notes?: NoteItem[]
  data?: ItineraryData
  dayIndex?: number
}

export function LocationDetailModal({ open, onClose, location, notes, data, dayIndex }: LocationDetailModalProps): JSX.Element | null {
  if (!open || !location) return null

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
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: location.color }} />
              <h2 className="text-base font-bold text-[#2D3436]">地点详情</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-full bg-[#F5F7FA] hover:bg-[#DCFAED] transition text-[#2D3436] text-sm"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: location.color }} />
            <p className="text-sm text-[#636E72] truncate">{location.name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 py-4">
          <LocationDetailContent location={location} notes={notes} data={data} dayIndex={dayIndex} />
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
