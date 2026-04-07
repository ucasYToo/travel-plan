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
    <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl shadow-spring border border-[var(--border-spring)] px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {zoom !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-[var(--sakura-pale)] text-[10px] font-semibold text-[var(--sakura-deep)] shrink-0 sm:text-xs">
            z{zoom}
          </span>
        )}
        <select
          value={currentCity}
          onChange={(e) => onCityChange(e.target.value)}
          className="px-1 py-1 bg-transparent text-xs font-medium text-[var(--ink)] cursor-pointer outline-none truncate max-w-[90px] sm:max-w-[140px] sm:text-sm"
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city.id} value={city.id}>
              {city.flag} {city.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center bg-[var(--bg-main)] rounded-full p-0.5 border border-[var(--border-spring)]">
        <button
          type="button"
          onClick={onResetView}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition sm:px-4 sm:py-1.5 sm:text-xs ${
            viewMode === 'full'
              ? 'bg-[var(--bud-green)] text-white'
              : 'text-[var(--stone)] hover:text-[var(--ink)]'
          }`}
        >
          全景
        </button>
        <button
          type="button"
          onClick={onRouteView}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition sm:px-4 sm:py-1.5 sm:text-xs ${
            viewMode === 'route'
              ? 'bg-[var(--bud-green)] text-white'
              : 'text-[var(--stone)] hover:text-[var(--ink)]'
          }`}
        >
          线路
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--ink)] cursor-pointer select-none sm:text-xs sm:gap-2">
          <input
            type="checkbox"
            checked={settings.showLocationNames}
            onChange={(e) => onSettingsChange({ ...settings, showLocationNames: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-[var(--border-spring)] text-[var(--sakura-pink)] focus:ring-[var(--sakura-pink)] sm:w-4 sm:h-4"
          />
          地点名
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--ink)] cursor-pointer select-none sm:text-xs sm:gap-2">
          <input
            type="checkbox"
            checked={settings.showTransit}
            onChange={(e) => onSettingsChange({ ...settings, showTransit: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-[var(--border-spring)] text-[var(--sakura-pink)] focus:ring-[var(--sakura-pink)] sm:w-4 sm:h-4"
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
                    ? 'bg-[var(--sakura-pink)] border-[var(--sakura-pink)] text-white'
                    : 'bg-white/90 border-[var(--border-spring)] text-[var(--stone)] hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDaysExpanded(false)}
            className="shrink-0 p-1.5 rounded-full bg-white border border-[var(--border-spring)] text-[var(--stone)] hover:text-[var(--ink)] transition shadow-sm sm:p-2"
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
              className="sm:w-4 sm:h-4"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setDaysExpanded(true)}
          className="shrink-0 p-1.5 rounded-full bg-white border border-[var(--border-spring)] text-[var(--stone)] hover:text-[var(--ink)] transition shadow-sm ml-auto sm:p-2"
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
            className="sm:w-4 sm:h-4"
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
