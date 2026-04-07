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
  onClearRoute: () => void
  onResetView: () => void
  onSelectDay: (dayIndex: number) => void
  onSettingsChange: (settings: MapControlsSettings) => void
  viewMode: 'route' | 'full'
  onRouteView: () => void
}

export function MapControls({
  currentCity,
  settings,
  dayOptions: dayOpts,
  activeDay,
  onCityChange,
  onClearRoute,
  onResetView,
  onSelectDay,
  onSettingsChange,
  viewMode,
  onRouteView
}: MapControlsProps): JSX.Element {
  return (
    <>
      {/* Desktop Quick Actions */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex gap-2 items-center">
        {/* Map Display Controls */}
        <div className="flex gap-2 items-center glass rounded-full shadow-soft px-3 py-1.5 border border-white/50">
          <label className="flex items-center gap-1.5 text-xs text-[#2D3436] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showLocationNames}
              onChange={(e) => onSettingsChange({ ...settings, showLocationNames: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-[#DFE6E9] text-[#88D8B0] focus:ring-[#A8E6CF]"
            />
            地点名
          </label>
          <span className="w-px h-3 bg-[#DFE6E9]" />
          <label className="flex items-center gap-1.5 text-xs text-[#2D3436] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showTransit}
              onChange={(e) => onSettingsChange({ ...settings, showTransit: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-[#DFE6E9] text-[#88D8B0] focus:ring-[#A8E6CF]"
            />
            交通
          </label>
        </div>
        {/* City Selector */}
        <select
          value={currentCity}
          onChange={(e) => onCityChange(e.target.value)}
          className="px-3 py-1.5 bg-white rounded-full shadow-soft text-sm font-medium text-[#2D3436] hover:bg-[#F5F7FA] transition cursor-pointer outline-none border border-white/50"
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city.id} value={city.id}>
              {city.flag} {city.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onClearRoute}
          className="px-3 py-1.5 bg-white rounded-full shadow-soft text-sm font-medium text-[#2D3436] hover:bg-[#F5F7FA] transition border border-white/50"
        >
          清除路线
        </button>
        <button
          type="button"
          onClick={onResetView}
          className="px-3 py-1.5 bg-[#A8E6CF] rounded-full shadow-soft text-sm font-medium text-[#2D3436] hover:bg-[#88D8B0] transition border border-white/30"
        >
          查看全景
        </button>
      </div>

      {/* Mobile: View Toggle + Settings (top right) */}
      <div className="absolute top-4 right-4 z-30 sm:hidden flex flex-col items-end gap-2">
        {/* View toggle */}
        <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-soft border border-white/50 p-0.5">
          <button
            type="button"
            onClick={onResetView}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
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
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              viewMode === 'route'
                ? 'bg-[#A8E6CF] text-[#2D3436]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            路线
          </button>
        </div>
        {/* Day selector */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {dayOpts.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDay(i)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
                activeDay === i
                  ? 'bg-[#A8E6CF] border-[#A8E6CF] text-[#2D3436]'
                  : 'bg-white/80 border-white/50 text-[#636E72] hover:bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Display settings */}
        <div className="flex gap-2 items-center glass rounded-full shadow-soft px-3 py-1.5 border border-white/50">
          <label className="flex items-center gap-1.5 text-xs text-[#2D3436] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showLocationNames}
              onChange={(e) => onSettingsChange({ ...settings, showLocationNames: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-[#DFE6E9] text-[#88D8B0] focus:ring-[#A8E6CF]"
            />
            地点名
          </label>
          <span className="w-px h-3 bg-[#DFE6E9]" />
          <label className="flex items-center gap-1.5 text-xs text-[#2D3436] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showTransit}
              onChange={(e) => onSettingsChange({ ...settings, showTransit: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-[#DFE6E9] text-[#88D8B0] focus:ring-[#A8E6CF]"
            />
            交通
          </label>
        </div>
      </div>

      {/* Mobile Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-[45] sm:hidden bg-white/80 backdrop-blur-md border-t border-[#DFE6E9] px-4 py-2 safe-area-pb">
        <div className="flex items-center justify-between gap-3">
          <select
            value={currentCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#F5F7FA] rounded-[12px] text-sm font-medium text-[#2D3436] hover:bg-white transition cursor-pointer outline-none border border-[#DFE6E9]"
          >
            {CITY_OPTIONS.map((city) => (
              <option key={city.id} value={city.id}>
                {city.flag} {city.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onClearRoute}
            className="px-3 py-2 bg-[#F5F7FA] border border-[#DFE6E9] rounded-[14px] text-sm font-medium text-[#2D3436] hover:bg-white transition"
          >
            清除路线
          </button>
        </div>
      </div>
    </>
  )
}
