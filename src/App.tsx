import { useState } from 'react'
import { MapView } from './components/MapView'
import { Sidebar } from './components/Sidebar'
import { TransportModal } from './components/TransportModal'
import { CITY_OPTIONS, getCityData, DEFAULT_CITY } from './data'
import type { TransitDetail } from './types'

function App() {
  const [currentCity, setCurrentCity] = useState(DEFAULT_CITY)
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [resetView, setResetView] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [transitDetail, setTransitDetail] = useState<TransitDetail | null>(null)

  const cityData = getCityData(currentCity)
  if (!cityData) {
    return <div className="p-8 text-center">城市数据加载失败</div>
  }

  const showTransit = (detail: TransitDetail) => {
    setTransitDetail(detail)
    setModalOpen(true)
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

      <TransportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        detail={transitDetail}
      />
    </div>
  )
}

export default App
