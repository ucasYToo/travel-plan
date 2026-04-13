import { useState, useEffect, useCallback, useRef } from 'react'
import L from 'leaflet'
import { MapView } from './components/MapView'
import { MapControls } from './components/MapControls'
import { BottomSheet } from './components/BottomSheet'
import { SidebarContent } from './components/content/SidebarContent'
import { DetailContent, type DetailViewMode } from './components/content/DetailContent'
import { ExportContainer, type ExportContainerRef } from './components/export/ExportContainer'
import { useMapExporter } from './components/export/useMapExporter'
import type { ExportMode } from './components/export/utils'
import { excludeOutlierLocations } from './components/export/exportMapUtils'
import { getCityData, DEFAULT_CITY } from './data'
import type { TransitDetail, NoteItem, LocationOrGroup } from './types'
import styles from './App.module.css'

declare global {
  interface Window {
    __tripPackerHeadlessExport?: (modes: string[]) => Promise<Record<string, string>>
    __tripPackerExports?: Record<string, string>
  }
}

const STORAGE_KEY = 'travel-map-settings'

function getInitialSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        showLocationNames: !!parsed.showLocationNames,
        showTransit: !!parsed.showTransit,
      }
    }
  } catch {
    // ignore
  }
  return {
    showLocationNames: true,
    showTransit: false,
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

  // Export state
  const [exportQueue, setExportQueue] = useState<{ mode: ExportMode; day: number | null }[]>([])
  const [isExportingItem, setIsExportingItem] = useState(false)
  const currentExport = exportQueue[0] ?? null
  const exportContainerRef = useRef<ExportContainerRef>(null)
  const { isExporting, exportImage, trackTile } = useMapExporter({
    cityId: currentCity,
  })

  const isExportingOverall = isExporting || isExportingItem || exportQueue.length > 0

  // Headless export refs
  const headlessModesRef = useRef<Set<string>>(new Set())
  const headlessResolveRef = useRef<((value: Record<string, string>) => void) | null>(null)
  const headlessResultsRef = useRef<Record<string, string>>({})

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const cityData = getCityData(currentCity)

  // Update document title based on current city metadata
  useEffect(() => {
    if (cityData?.metadata?.title) {
      document.title = cityData.metadata.title
    }
  }, [cityData])

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

  // Expose headless export API
  useEffect(() => {
    window.__tripPackerHeadlessExport = (modes: string[]) => {
      return new Promise((resolve) => {
        headlessResolveRef.current = resolve
        headlessResultsRef.current = {}
        headlessModesRef.current = new Set(modes)
        const queue: { mode: ExportMode; day: number | null }[] = []
        for (const mode of modes) {
          if (mode === 'panorama' || mode === 'itinerary-vertical') {
            queue.push({ mode: mode as ExportMode, day: null })
          }
        }
        setExportQueue(queue)
      })
    }

    return () => {
      delete window.__tripPackerHeadlessExport
    }
  }, [])

  // Queue processing: kick off next export when idle and queue non-empty
  useEffect(() => {
    if (isExportingItem || exportQueue.length === 0) return
    setIsExportingItem(true)
  }, [isExportingItem, exportQueue])

  // Resolve headless export when queue is done
  useEffect(() => {
    if (!isExportingItem && exportQueue.length === 0 && headlessResolveRef.current) {
      const results = { ...headlessResultsRef.current }
      headlessResolveRef.current(results)
      headlessResolveRef.current = null
      headlessModesRef.current = new Set()
      headlessResultsRef.current = {}
    }
  }, [isExportingItem, exportQueue])

  // Screenshot effect: wait for container mount -> fitBounds -> export -> cleanup
  useEffect(() => {
    if (!isExportingItem || exportQueue.length === 0) return

    const { mode, day } = exportQueue[0]

    // Delay to next tick so ExportContainer ref is available
    const timer = setTimeout(() => {
      const run = async () => {
        if (!cityData) return
        const map = exportContainerRef.current?.getMap()
        const root = exportContainerRef.current?.getRoot()

        if (!map || !root) {
          console.warn('[Export] container not ready')
          setIsExportingItem(false)
          setExportQueue((prev) => prev.slice(1))
          return
        }

        try {
          const isDayMode = mode === 'day-horizontal' || mode === 'day-vertical'
          const filtered = excludeOutlierLocations(cityData, isDayMode ? day : null)
          const bounds = L.latLngBounds([])
          let hasPoint = false
          if (isDayMode && day !== null) {
            const dayPlan = cityData.days[day]
            if (dayPlan && dayPlan.path.length > 0) {
              for (const p of dayPlan.path) {
                const loc = filtered[p.locationId]
                if (loc) {
                  bounds.extend([loc.lat, loc.lng])
                  hasPoint = true
                }
              }
            }
          } else {
            for (const loc of Object.values(filtered)) {
              bounds.extend([loc.lat, loc.lng])
              hasPoint = true
            }
          }
          if (hasPoint) {
            map.fitBounds(bounds, {
              padding: [40, 40],
              maxZoom: isDayMode ? 16 : 14,
              animate: false,
            })
          }

          await new Promise((r) => setTimeout(r, 400))
          const isHeadless = headlessModesRef.current.has(mode)
          if (isHeadless) {
            const dataUrl = await exportImage(mode, root, cityData, day, false)
            if (dataUrl) {
              headlessResultsRef.current[mode] = dataUrl
            }
          } else {
            await exportImage(mode, root, cityData, day)
          }
        } catch (err) {
          console.error('[Export] failed:', err)
        } finally {
          setIsExportingItem(false)
          setExportQueue((prev) => prev.slice(1))
        }
      }

      run()
    }, 0)

    return () => clearTimeout(timer)
  }, [isExportingItem, exportQueue, cityData, exportImage])

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
    setResetView((v) => v + 1)
  }

  const handleResetView = () => {
    setActiveDay(null)
    setResetView((v) => v + 1)
  }

  const handleRouteView = () => {
    if (activeDay === null) {
      setActiveDay(0)
    }
    setResetView((v) => v + 1)
  }

  const handleExportClick = useCallback((mode: ExportMode, days: number[]) => {
    if (mode === 'panorama' || mode === 'itinerary-vertical') {
      setExportQueue([{ mode, day: null }])
    } else {
      setExportQueue(days.map((d) => ({ mode, day: d })))
    }
  }, [])

  if (!cityData) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorContent}>
          <p className={styles.errorTitle}>城市数据加载失败</p>
          <p className={styles.errorHint}>请检查网络连接或稍后再试</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Map always fills the entire viewport */}
      <div className={styles.mapContainer}>
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
          dayOptions={cityData.days.map((d) => `Day${d.day}`)}
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
          onExportClick={handleExportClick}
          isExporting={isExportingOverall}
        />
      </div>

      {/* Left Panel: fixed overlay (desktop only) */}
      {!leftPanelCollapsed && (
        <aside className={styles.leftPanel}>
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed(true)}
            className={styles.leftToggle}
            aria-label="收起面板"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          className={styles.collapsedButton}
          aria-label="展开菜单"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Right Panel: fixed overlay (desktop only) */}
      {!rightPanelCollapsed && detailViewMode !== 'none' && (
        <aside className={styles.rightPanel}>
          {/* Collapse/close toggle */}
          <button
            type="button"
            onClick={() => {
              setDetailViewMode('none')
              setSelectedTransit(null)
              setRightPanelCollapsed(true)
            }}
            className={styles.rightToggle}
            aria-label="收起面板"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
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

      {/* Export hidden container */}
      {currentExport && (
        <ExportContainer
          ref={exportContainerRef}
          mode={currentExport.mode}
          data={cityData}
          selectedDay={currentExport.day}
          showLocationNames={settings.showLocationNames}
          showTransitLabels={settings.showTransit}
          trackTile={trackTile}
        />
      )}
    </div>
  )
}

export default App
