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
      <div className="absolute top-4 right-4 z-10 hidden sm:flex gap-2 items-center">
        {/* Map Display Controls */}
        <div className="flex gap-2 items-center bg-white/90 backdrop-blur rounded-full shadow-md px-3 py-1.5">
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showLocationNames}
              onChange={(e) => onSettingsChange({ ...settings, showLocationNames: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
            />
            地点名
          </label>
          <span className="w-px h-3 bg-gray-200" />
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showTransit}
              onChange={(e) => onSettingsChange({ ...settings, showTransit: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
            />
            交通
          </label>
        </div>
        {/* City Selector */}
        <select
          value={currentCity}
          onChange={(e) => onCityChange(e.target.value)}
          className="px-3 py-1.5 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer outline-none"
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
          className="px-3 py-1.5 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          清除路线
        </button>
        <button
          type="button"
          onClick={onResetView}
          className="px-3 py-1.5 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          查看全景
        </button>
      </div>

      {/* Mobile Map Display Controls (top right) */}
      <div className="absolute top-4 right-4 z-30 sm:hidden flex gap-2 items-center bg-white/95 backdrop-blur rounded-full shadow-md px-3 py-1.5">
        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showLocationNames}
            onChange={(e) => onSettingsChange({ ...settings, showLocationNames: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          地点名
        </label>
        <span className="w-px h-3 bg-gray-200" />
        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showTransit}
            onChange={(e) => onSettingsChange({ ...settings, showTransit: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          交通
        </label>
      </div>

      {/* Mobile Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-between gap-3">
          <select
            value={currentCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer outline-none border border-gray-200"
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
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              清除路线
            </button>
            <button
              type="button"
              onClick={onResetView}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
            >
              查看全景
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
