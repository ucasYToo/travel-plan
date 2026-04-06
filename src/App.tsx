import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { Sidebar } from './components/Sidebar'
import { TransportModal } from './components/TransportModal'
import { LocationDetailModal } from './components/LocationDetailModal'
import { CITY_OPTIONS, getCityData, DEFAULT_CITY } from './data'
import type { TransitDetail, NoteItem, LocationOrGroup } from './types'

const STORAGE_KEY = 'seoul-map-settings'

function getInitialSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        showLocationNames: !!parsed.showLocationNames,
        showTransit: !!parsed.showTransit
      }
    }
  } catch {
    // ignore
  }
  return {
    showLocationNames: true,
    showTransit: false
  }
}

function App() {
  const [currentCity, setCurrentCity] = useState(DEFAULT_CITY)
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [resetView, setResetView] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [transitDetail, setTransitDetail] = useState<TransitDetail | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailData, setDetailData] = useState<{ location: LocationOrGroup; notes?: NoteItem[]; dayIndex?: number } | null>(null)
  const [settings, setSettings] = useState(getInitialSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const cityData = getCityData(currentCity)
  if (!cityData) {
    return <div className="p-8 text-center">城市数据加载失败</div>
  }

  const showTransit = (detail: TransitDetail) => {
    setTransitDetail(detail)
    setModalOpen(true)
  }

  const showLocationDetail = (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => {
    setDetailData({ location, notes, dayIndex })
    setDetailModalOpen(true)
  }

  const handleCityChange = (cityId: string) => {
    setCurrentCity(cityId)
    setActiveDay(null)
    setResetView(v => v + 1)
  }

  return (
    <div className="relative h-full w-full">
      <MapView
        data={cityData}
        activeDay={activeDay}
        resetView={resetView}
        onShowTransit={showTransit}
        onShowLocationDetail={showLocationDetail}
        showLocationNames={settings.showLocationNames}
        showTransitLabels={settings.showTransit}
      />
      <Sidebar
        data={cityData}
        activeDay={activeDay}
        onSelectDay={(idx) => {
          setActiveDay(idx)
          setSidebarOpen(false)
        }}
        isOpen={sidebarOpen}
        onShowTransit={showTransit}
        onShowLocationDetail={showLocationDetail}
      />

      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute top-4 left-4 z-20 sm:hidden w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Desktop Quick Actions */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex gap-2 items-center">
        {/* Map Display Controls */}
        <div className="flex gap-2 items-center bg-white/90 backdrop-blur rounded-full shadow-md px-3 py-1.5">
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showLocationNames}
              onChange={(e) => setSettings(s => ({ ...s, showLocationNames: e.target.checked }))}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
            />
            地点名
          </label>
          <span className="w-px h-3 bg-gray-200" />
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.showTransit}
              onChange={(e) => setSettings(s => ({ ...s, showTransit: e.target.checked }))}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
            />
            交通
          </label>
        </div>
        {/* City Selector */}
        <select
          value={currentCity}
          onChange={(e) => handleCityChange(e.target.value)}
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
          onClick={() => setActiveDay(null)}
          className="px-3 py-1.5 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          清除路线
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveDay(null)
            setResetView((v) => v + 1)
          }}
          className="px-3 py-1.5 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          查看全景
        </button>
      </div>

      {/* Mobile Display Controls */}
      <div className="absolute top-4 right-4 z-30 sm:hidden flex gap-2 items-center bg-white/95 backdrop-blur rounded-full shadow-md px-3 py-1.5">
        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showLocationNames}
            onChange={(e) => setSettings(s => ({ ...s, showLocationNames: e.target.checked }))}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          地点名
        </label>
        <span className="w-px h-3 bg-gray-200" />
        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.showTransit}
            onChange={(e) => setSettings(s => ({ ...s, showTransit: e.target.checked }))}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          交通
        </label>
      </div>

      <TransportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        detail={transitDetail}
      />

      <LocationDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        location={detailData?.location ?? null}
        notes={detailData?.notes}
        data={cityData}
        dayIndex={detailData?.dayIndex}
      />
    </div>
  )
}

export default App
