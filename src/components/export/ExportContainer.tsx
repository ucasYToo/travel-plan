import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { ExportMapView } from './ExportMapView'
import { ExportSidebarContent } from './ExportSidebarContent'
import { ExportMapOverlay } from './ExportMapOverlay'
import type { ExportMode } from './utils'
import type { ItineraryData } from '../../types'
import styles from './ExportContainer.module.css'

function MapRefExtractor({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap()
  useEffect(() => {
    onMap(map)
  }, [map, onMap])
  return null
}

export interface ExportContainerRef {
  getMap: () => L.Map | null
  getRoot: () => HTMLDivElement | null
}

interface ExportContainerProps {
  mode: ExportMode
  data: ItineraryData
  selectedDay: number | null
  showLocationNames: boolean
  showTransitLabels: boolean
  trackTile: (img: HTMLImageElement) => void
}

const isDayMode = (mode: ExportMode) => mode === 'day-horizontal' || mode === 'day-vertical'
const isVertical = (mode: ExportMode) => mode === 'itinerary-vertical' || mode === 'day-vertical'

export const ExportContainer = forwardRef<ExportContainerRef, ExportContainerProps>(
  function ExportContainer({ mode, data, selectedDay, showLocationNames, showTransitLabels, trackTile }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<L.Map | null>(null)

    useImperativeHandle(ref, () => ({
      getMap: () => mapRef.current,
      getRoot: () => rootRef.current,
    }))

    const cssWidth = isVertical(mode) ? 540 : 1280
    const cssHeight = isVertical(mode) ? -1 : 720

    const mapActiveDay = isDayMode(mode) ? selectedDay : null
    const colorizeByDay = !isDayMode(mode)
    const excludeOutliers = true

    const brandLogo = isVertical(mode) ? (
      <div className={styles.brandLogo}>
        <span className={styles.brandMark}>tp</span>
        <span className={styles.brandText}>trip-packer</span>
      </div>
    ) : null

    let content: JSX.Element

    if (mode === 'day-horizontal') {
      content = (
        <div
          ref={rootRef}
          className={styles.exportContainer}
          style={{ width: cssWidth, height: cssHeight, display: 'flex' }}
          data-export-mode={mode}
        >
          <div className={styles.daySidebarWrap}>
            <ExportSidebarContent data={data} activeDay={selectedDay} variant="dayHorizontal" />
          </div>
          <div className={styles.dayMapWrap}>
            <MapContainer
              className={styles.map}
              style={{ height: '100%', width: '100%' }}
              center={[data.metadata.mapCenter?.lat ?? 0, data.metadata.mapCenter?.lng ?? 0]}
              zoom={data.metadata.mapZoom ?? 12}
              zoomControl={false}
            >
              <MapRefExtractor onMap={(m) => { mapRef.current = m }} />
              <ExportMapView
                data={data}
                activeDay={mapActiveDay}
                resetView={0}
                showLocationNames={showLocationNames}
                showTransitLabels={showTransitLabels}
                trackTile={trackTile}
                country={data.metadata.country}
                excludeOutliers={excludeOutliers}
              />
            </MapContainer>
          </div>
        </div>
      )
    } else if (isVertical(mode)) {
      content = (
        <div
          ref={rootRef}
          className={styles.exportContainer}
          style={cssHeight > 0 ? { width: cssWidth, height: cssHeight } : { width: cssWidth }}
          data-export-mode={mode}
        >
          <div className={styles.verticalLayout}>
            <div className={styles.verticalMapWrap}>
              {brandLogo}
              <MapContainer
                className={styles.map}
                style={{ height: '100%', width: '100%' }}
                center={[data.metadata.mapCenter?.lat ?? 0, data.metadata.mapCenter?.lng ?? 0]}
                zoom={data.metadata.mapZoom ?? 12}
                zoomControl={false}
              >
                <MapRefExtractor onMap={(m) => { mapRef.current = m }} />
                <ExportMapView
                  data={data}
                  activeDay={mapActiveDay}
                  resetView={0}
                  showLocationNames={showLocationNames}
                  showTransitLabels={showTransitLabels}
                  trackTile={trackTile}
                  country={data.metadata.country}
                  colorizeByDay={colorizeByDay}
                  excludeOutliers={excludeOutliers}
                />
              </MapContainer>
            </div>
            <div className={styles.verticalContentWrap}>
              <ExportSidebarContent data={data} activeDay={selectedDay} />
            </div>
          </div>
        </div>
      )
    } else {
      // panorama
      content = (
        <div
          ref={rootRef}
          className={styles.exportContainer}
          style={{ width: cssWidth, height: cssHeight }}
          data-export-mode={mode}
        >
          <div className={styles.mapWrap}>
            <MapContainer
              className={styles.map}
              style={{ height: '100%', width: '100%' }}
              center={[data.metadata.mapCenter?.lat ?? 0, data.metadata.mapCenter?.lng ?? 0]}
              zoom={data.metadata.mapZoom ?? 12}
              zoomControl={false}
            >
              <MapRefExtractor onMap={(m) => { mapRef.current = m }} />
              <ExportMapView
                data={data}
                activeDay={mapActiveDay}
                resetView={0}
                showLocationNames={showLocationNames}
                showTransitLabels={showTransitLabels}
                trackTile={trackTile}
                country={data.metadata.country}
                colorizeByDay={colorizeByDay}
                excludeOutliers={excludeOutliers}
              />
            </MapContainer>
            <ExportMapOverlay data={data} activeDay={mapActiveDay} />
          </div>
        </div>
      )
    }

    return createPortal(content, document.body)
  }
)
