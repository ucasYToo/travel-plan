import type { ItineraryData, LocationOrGroup, NoteItem } from '../types'
import { LocationDetailContent } from './LocationDetailContent'

export interface LocationDetailPanelProps {
  location: LocationOrGroup | null
  notes?: NoteItem[]
  data?: ItineraryData
  dayIndex?: number
}

export function LocationDetailPanel({ location, notes, data, dayIndex }: LocationDetailPanelProps): JSX.Element {
  if (!location) {
    return (
      <div className="rounded-[20px] bg-white shadow-soft p-6 text-center max-w-xl">
        <p className="text-[#2D3436] text-lg">🌸 点击地图或行程查看详情 🌸</p>
        <p className="text-[#636E72] text-sm mt-2">探索首尔的春天美景</p>
      </div>
    )
  }

  const typeLabel =
    location.type === 'hotel_group'
      ? '住宿地点'
      : location.type === 'group'
        ? '商圈 / 景点组'
        : '景点'

  return (
    <div className="rounded-[20px] bg-white shadow-soft p-5 max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DFE6E9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: location.color }} />
            <h2 className="text-[#2D3436] font-bold text-lg">{location.name}</h2>
          </div>
          <p className="text-xs text-[#636E72] mt-1">{typeLabel}</p>
        </div>
        <div className="text-2xl">🌸</div>
      </div>

      <LocationDetailContent location={location} notes={notes} data={data} dayIndex={dayIndex} />
    </div>
  )
}
