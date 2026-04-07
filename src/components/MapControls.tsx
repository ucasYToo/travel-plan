import { useState } from 'react'
import { CITY_OPTIONS } from '../data'

export interface MapControlsSettings {
  showLocationNames: boolean
  showTransit: boolean
}

export interface MapControlsProps {
  currentCity: string
  settings: MapControlsSettings
  dayOptions: string[]
  activeDay: number | null
  onCityChange: (cityId: string) => void
  onResetView: () => void
  onSelectDay: (dayIndex: number) => void
  onSettingsChange: (settings: MapControlsSettings) => void
  viewMode: 'route' | 'full'
  onRouteView: () => void
  zoom?: number
}

export function MapControls({
  currentCity,
  settings,
  dayOptions: dayOpts,
  activeDay,
  onCityChange,
  onResetView,
  onSelectDay,
  onSettingsChange,
  viewMode,
  onRouteView,
  zoom
}: MapControlsProps): JSX.Element {
  const [daysExpanded, setDaysExpanded] = useState(true)

  const firstRow = (
    <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl shadow-soft border border-white/50 px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {zoom !== undefined && (
          <span className="px-1.5 py-px rounded-full bg-[#F5F7FA] text-[10px] font-semibold text-[#2D3436] shrink-0 sm:text-xs">
            z{zoom}
          </span>
        )}
        <select
          value={currentCity}
          onChange={(e) => onCityChange(e.target.value)}
          className="px-1 py-1 bg-transparent text-xs font-medium text-[#2D3436] cursor-pointer outline-none truncate max-w-[90px] sm:max-w-[140px] sm:text-sm"
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city.id} value={city.id}>
              {city.flag} {city.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center bg-white/80 rounded-full p-0.5">
        <button
          type="button"
          onClick={onResetView}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition sm:px-4 sm:py-1.5 sm:text-xs ${
            viewMode === 'full'
              ? 'bg-[#A8E6CF] text-[#2D3436]'
              : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          全景
        </button>
        <button
          type="button"
          onClick={onRouteView}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition sm:px-4 sm:py-1.5 sm:text-xs ${
            viewMode === 'route'
              ? 'bg-[#A8E6CF] text-[#2D3436]'
              : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          线路
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-[11px] text-[#2D3436] cursor-pointer select-none sm:text-xs sm:gap-1.5">
          <input
            type="checkbox"
            checked={settings.showLocationNames}
            onChange={(e) => onSettingsChange({ ...settings, showLocationNames: e.target.checked })}
            className="w-3 h-3 rounded border-[#DFE6E9] text-[#88D8B0] focus:ring-[#A8E6CF] sm:w-4 sm:h-4"
          />
          地点名
        </label>
        <label className="flex items-center gap-1 text-[11px] text-[#2D3436] cursor-pointer select-none sm:text-xs sm:gap-1.5">
          <input
            type="checkbox"
            checked={settings.showTransit}
            onChange={(e) => onSettingsChange({ ...settings, showTransit: e.target.checked })}
            className="w-3 h-3 rounded border-[#DFE6E9] text-[#88D8B0] focus:ring-[#A8E6CF] sm:w-4 sm:h-4"
          />
          交通
        </label>
      </div>
    </div>
  )

  const secondRow = (
    <div className="flex items-center gap-1.5">
      {daysExpanded ? (
        <>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 py-0.5 flex-1 sm:overflow-visible sm:gap-2">
            {dayOpts.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectDay(i)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition border sm:px-4 sm:py-1.5 sm:text-xs ${
                  activeDay === i
                    ? 'bg-[#A8E6CF] border-[#A8E6CF] text-[#2D3436]'
                    : 'bg-white/90 border-white/50 text-[#636E72] hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDaysExpanded(false)}
            className="shrink-0 p-1.5 rounded-full bg-white/80 hover:bg-white transition shadow-sm sm:p-2"
            aria-label="收起日期"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#636E72] sm:w-4 sm:h-4"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setDaysExpanded(true)}
          className="shrink-0 p-1.5 rounded-full bg-white/80 hover:bg-white transition shadow-sm ml-auto sm:p-2"
          aria-label="展开日期"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#636E72] sm:w-4 sm:h-4"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop: Top Right Two Rows */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex flex-col gap-2 w-fit sm:gap-3">
        {firstRow}
        {secondRow}
      </div>

      {/* Mobile: Top Two Rows */}
      <div className="absolute top-3 left-3 right-3 z-30 sm:hidden flex flex-col gap-2">
        {firstRow}
        {secondRow}
      </div>
    </>
  )
}
