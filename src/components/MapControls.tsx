import { CITY_OPTIONS } from '../data'

export interface MapControlsSettings {
  showLocationNames: boolean
  showTransit: boolean
}

export interface MapControlsProps {
  currentCity: string
  settings: MapControlsSettings
  onCityChange: (cityId: string) => void
  onClearRoute: () => void
  onResetView: () => void
  onSettingsChange: (settings: MapControlsSettings) => void
}

export function MapControls({
  currentCity,
  settings,
  onCityChange,
  onClearRoute,
  onResetView,
  onSettingsChange
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

      {/* Mobile Map Display Controls (top right) */}
      <div className="absolute top-4 right-4 z-30 sm:hidden flex gap-2 items-center glass rounded-full shadow-soft px-3 py-1.5 border border-white/50">
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

      {/* Mobile Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/80 backdrop-blur-md border-t border-[#DFE6E9] px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-between gap-3">
          <select
            value={currentCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-3 py-2 bg-[#F5F7FA] rounded-[12px] text-sm font-medium text-[#2D3436] hover:bg-white transition cursor-pointer outline-none border border-[#DFE6E9]"
          >
            {CITY_OPTIONS.map((city) => (
              <option key={city.id} value={city.id}>
                {city.flag} {city.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearRoute}
              className="px-3 py-2 bg-[#F5F7FA] border border-[#DFE6E9] rounded-[14px] text-sm font-medium text-[#2D3436] hover:bg-white transition"
            >
              清除路线
            </button>
            <button
              type="button"
              onClick={onResetView}
              className="px-3 py-2 bg-[#A8E6CF] text-[#2D3436] rounded-[14px] text-sm font-medium hover:bg-[#88D8B0] transition"
            >
              查看全景
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
