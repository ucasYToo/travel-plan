import { useState, useEffect, useCallback } from 'react'
import { MapView } from './components/MapView'
import { MapControls } from './components/MapControls'
import { BottomSheet } from './components/BottomSheet'
import { SidebarContent } from './components/content/SidebarContent'
import { DetailContent, type DetailViewMode } from './components/content/DetailContent'
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

  // Panel state
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true)
  const [itinerarySnap, setItinerarySnap] = useState(1) // 0=collapsed, 1=peek, 2=full

  const [resetView, setResetView] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<{ location: LocationOrGroup; notes?: NoteItem[]; dayIndex?: number } | null>(null)
  const [selectedTransit, setSelectedTransit] = useState<TransitDetail | null>(null)
  const [detailViewMode, setDetailViewMode] = useState<DetailViewMode>('none')
  const [settings, setSettings] = useState(getInitialSettings)
  const [zoom, setZoom] = useState(12)

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
      setRightPanelCollapsed(true)
      setDetailViewMode('none')
      setSelectedTransit(null)
    }
  }, [activeDay, cityData])

  const showTransit = useCallback((detail: TransitDetail) => {
    setSelectedTransit(detail)
    setDetailViewMode('transit')
    setRightPanelCollapsed(false)
  }, [])

  const showLocationDetail = useCallback((location: LocationOrGroup, notes?: NoteItem[], dayIndex?: number) => {
    setSelectedLocation({ location, notes, dayIndex })
    setDetailViewMode('location')
    setRightPanelCollapsed(false)
  }, [])

  const handleBackFromTransit = useCallback(() => {
    if (selectedLocation) {
      setDetailViewMode('location')
      setSelectedTransit(null)
    } else {
      setDetailViewMode('none')
      setSelectedTransit(null)
      setRightPanelCollapsed(true)
    }
  }, [selectedLocation])

  const handleCityChange = (cityId: string) => {
    setCurrentCity(cityId)
    setActiveDay(null)
    setResetView(v => v + 1)
  }

  const handleResetView = () => {
    setActiveDay(null)
    setResetView(v => v + 1)
  }

  const handleRouteView = () => {
    if (activeDay === null) {
      setActiveDay(0)
    }
    setResetView(v => v + 1)
  }

  if (!cityData) {
    return <div className="p-8 text-center">城市数据加载失败</div>
  }

  return (
    <div className="relative h-full w-full">
      {/* Map always fills the entire viewport */}
      <div className="absolute inset-0 h-full w-full">
        <MapView
          data={cityData}
          activeDay={activeDay}
          resetView={resetView}
          onShowTransit={showTransit}
          onShowLocationDetail={showLocationDetail}
          showLocationNames={settings.showLocationNames}
          showTransitLabels={settings.showTransit}
          onZoomChange={setZoom}
        />
        <MapControls
          currentCity={currentCity}
          settings={settings}
          dayOptions={cityData.days.map(d => `Day${d.day}`)}
          activeDay={activeDay}
          onCityChange={handleCityChange}
          onResetView={handleResetView}
          onSelectDay={(idx) => {
            setActiveDay(idx === activeDay ? null : idx)
          }}
          onSettingsChange={setSettings}
          viewMode={activeDay === null ? 'full' : 'route'}
          onRouteView={handleRouteView}
          zoom={zoom}
        />
      </div>

      {/* Left Panel: fixed overlay (desktop only) */}
      {!leftPanelCollapsed && (
        <aside className="hidden sm:flex fixed left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur shadow-xl z-20 flex-col">
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed(true)}
            className="absolute top-4 -right-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition"
            aria-label="收起面板"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <SidebarContent
            data={cityData}
            activeDay={activeDay}
            onSelectDay={(idx) => {
              setActiveDay(idx === activeDay ? null : idx)
            }}
            onShowTransit={showTransit}
            onShowLocationDetail={showLocationDetail}
          />
        </aside>
      )}

      {/* Left panel collapsed toggle button */}
      {leftPanelCollapsed && (
        <button
          type="button"
          onClick={() => setLeftPanelCollapsed(false)}
          className="fixed left-4 top-4 z-30 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-soft flex items-center justify-center text-[#2D3436] hover:bg-white transition border border-white/50"
          aria-label="展开菜单"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Right Panel: fixed overlay (desktop only) */}
      {!rightPanelCollapsed && detailViewMode !== 'none' && (
        <aside className="hidden sm:flex fixed right-0 top-0 bottom-0 w-80 bg-[#F5F7FA] z-20 flex-col">
          {/* Collapse/close toggle */}
          <button
            type="button"
            onClick={() => {
              setDetailViewMode('none')
              setSelectedTransit(null)
              setRightPanelCollapsed(true)
            }}
            className="absolute top-4 -left-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition"
            aria-label="收起面板"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <DetailContent
            viewMode={detailViewMode}
            location={selectedLocation?.location ?? null}
            notes={selectedLocation?.notes}
            data={cityData}
            dayIndex={selectedLocation?.dayIndex}
            transitDetail={selectedTransit}
            onBack={detailViewMode === 'transit' ? handleBackFromTransit : undefined}
          />
        </aside>
      )}

      {/* Mobile: Itinerary Bottom Sheet */}
      <BottomSheet
        snapPoints={['48px', '45vh', 'calc(100vh - 72px)']}
        activeSnap={itinerarySnap}
        onSnapChange={(idx) => {
          setItinerarySnap(idx)
          setLeftPanelCollapsed(idx === 0)
        }}
        showBackdrop={itinerarySnap === 2}
      >
        <SidebarContent
          data={cityData}
          activeDay={activeDay}
          onSelectDay={(idx) => {
            const nextDay = idx === activeDay ? null : idx
            setActiveDay(nextDay)
            if (nextDay !== null) {
              setItinerarySnap(0)
            }
          }}
          onShowTransit={showTransit}
          onShowLocationDetail={showLocationDetail}
        />
      </BottomSheet>

      {/* Mobile: Detail Bottom Sheet */}
      {detailViewMode !== 'none' && (
        <BottomSheet
          snapPoints={['48px', '75vh']}
          activeSnap={1}
          onSnapChange={(idx) => {
            if (idx === 0) {
              setDetailViewMode('none')
              setSelectedTransit(null)
              setRightPanelCollapsed(true)
            }
          }}
          showBackdrop={true}
          onClose={() => {
            setDetailViewMode('none')
            setSelectedTransit(null)
            setRightPanelCollapsed(true)
          }}
        >
          <DetailContent
            viewMode={detailViewMode}
            location={selectedLocation?.location ?? null}
            notes={selectedLocation?.notes}
            data={cityData}
            dayIndex={selectedLocation?.dayIndex}
            transitDetail={selectedTransit}
            onBack={detailViewMode === 'transit' ? handleBackFromTransit : undefined}
          />
        </BottomSheet>
      )}
    </div>
  )
}

export default App
