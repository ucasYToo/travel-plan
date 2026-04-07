import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { Sidebar } from './components/Sidebar'
import { MapControls } from './components/MapControls'
import { TransportModal } from './components/TransportModal'
import { LocationDetailModal } from './components/LocationDetailModal'
import { LocationDetailPanel } from './components/LocationDetailPanel'
import { getCityData, DEFAULT_CITY } from './data'
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
  const [selectedLocation, setSelectedLocation] = useState<{ location: LocationOrGroup; notes?: NoteItem[]; dayIndex?: number } | null>(null)
  const [settings, setSettings] = useState(getInitialSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const cityData = getCityData(currentCity)

  // Auto-select first non-hotel location when active day changes
  useEffect(() => {
    if (activeDay !== null && cityData) {
      const day = cityData.days[activeDay]
      if (day) {
        const firstNonHotel = day.path.find((p) => {
          const loc = cityData.locations[p.locationId]
          return loc && loc.type !== 'hotel_group'
        })
        const targetPoint = firstNonHotel || day.path[0]
        if (targetPoint) {
          const loc = cityData.locations[targetPoint.locationId]
          if (loc) {
            setSelectedLocation({ location: loc, notes: targetPoint.notes, dayIndex: activeDay })
          }
        }
      }
    } else {
      setSelectedLocation(null)
    }
  }, [activeDay, cityData])

  if (!cityData) {
    return <div className="p-8 text-center">城市数据加载失败</div>
  }

  const showTransit = (detail: TransitDetail) => {
    setTransitDetail(detail)
    setModalOpen(true)
  }

  const showLocationDetail = (location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => {
    setSelectedLocation({ location, notes, dayIndex })
    // Only open modal on mobile; desktop uses the right panel
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setDetailData({ location, notes, dayIndex })
      setDetailModalOpen(true)
    }
  }

  const handleCityChange = (cityId: string) => {
    setCurrentCity(cityId)
    setActiveDay(null)
    setResetView(v => v + 1)
  }

  const handleClearRoute = () => {
    setActiveDay(null)
  }

  const handleResetView = () => {
    setActiveDay(null)
    setResetView(v => v + 1)
  }

  const handleDownloadJSON = () => {
    const data = JSON.stringify(cityData, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = cityData.metadata.title || 'itinerary'
    a.download = `${fileName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative h-full w-full sm:grid sm:grid-rows-1 sm:grid-cols-[280px_1fr_360px]">
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

      {/* Center: Map + Controls */}
      <div className="relative h-full sm:col-start-2">
        <MapView
          data={cityData}
          activeDay={activeDay}
          resetView={resetView}
          onShowTransit={showTransit}
          onShowLocationDetail={showLocationDetail}
          showLocationNames={settings.showLocationNames}
          showTransitLabels={settings.showTransit}
        />
        <MapControls
          currentCity={currentCity}
          settings={settings}
          onCityChange={handleCityChange}
          onClearRoute={handleClearRoute}
          onResetView={handleResetView}
          onSettingsChange={setSettings}
        />
      </div>

      {/* Right: Detail panel (desktop only) */}
      <div className="hidden sm:flex sm:col-start-3 sm:h-full bg-[#F5F7FA] overflow-y-auto p-4">
        <LocationDetailPanel
          location={selectedLocation?.location ?? null}
          notes={selectedLocation?.notes}
          data={cityData}
          dayIndex={selectedLocation?.dayIndex}
        />
      </div>

      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute top-4 left-4 z-50 sm:hidden w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-soft flex items-center justify-center text-[#2D3436] hover:bg-white transition border border-white/50"
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 bg-black/30 z-[40] sm:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

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
