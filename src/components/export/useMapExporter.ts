import { useCallback, useState } from 'react'
import { domToPng } from 'modern-screenshot'
import type { ExportMode } from './utils'
import { EXPORT_CONFIGS, buildFileName } from './utils'
import { useWaitForTiles } from './useWaitForTiles'
import { drawExportOverlay } from './drawExportOverlay'
import type { ItineraryData } from '../../types'

export interface UseMapExporterOptions {
  cityId: string
}

export interface UseMapExporterReturn {
  isExporting: boolean
  exportImage: {
    (mode: ExportMode, containerEl: HTMLElement, data: ItineraryData, activeDay: number | null, download?: true): Promise<void>
    (mode: ExportMode, containerEl: HTMLElement, data: ItineraryData, activeDay: number | null, download: false): Promise<string>
  }
  trackTile: (img: HTMLImageElement) => void
}

export function useMapExporter(options: UseMapExporterOptions): UseMapExporterReturn {
  const [isExporting, setIsExporting] = useState(false)
  const { trackTile, waitForTiles, clearTiles } = useWaitForTiles()

  const exportImage = useCallback(
    async (
      mode: ExportMode,
      containerEl: HTMLElement,
      data: ItineraryData,
      activeDay: number | null,
      download = true,
    ): Promise<string | void> => {
      setIsExporting(true)
      try {
        const config = EXPORT_CONFIGS[mode]

        // Reset layout force
        containerEl.offsetHeight

        // Wait for map tiles
        await waitForTiles(8000)

        // Wait for CSS transition/animation settle
        await new Promise((r) => setTimeout(r, 400))

        // Temporarily make container visible for modern-screenshot
        const originalOpacity = containerEl.style.opacity
        const originalZIndex = containerEl.style.zIndex
        containerEl.style.opacity = '1'
        containerEl.style.zIndex = '1'

        const mapDataUrl = await domToPng(containerEl, {
          scale: config.pixelRatio,
          width: config.cssWidth,
          height: config.cssHeight > 0 ? config.cssHeight : undefined,
          backgroundColor: '#ffffff',
        })

        containerEl.style.opacity = originalOpacity
        containerEl.style.zIndex = originalZIndex

        let finalDataUrl = mapDataUrl

        const needsOverlay = mode === 'panorama' || mode === 'day-horizontal'
        if (needsOverlay) {
          finalDataUrl = await composeWithOverlay(
            mapDataUrl,
            config.cssWidth,
            config.cssHeight,
            config.pixelRatio,
            data,
            activeDay,
            mode,
          )
        }

        if (download) {
          const link = document.createElement('a')
          const day = mode === 'day-horizontal' || mode === 'day-vertical' ? activeDay : null
          link.download = buildFileName(options.cityId, mode, day)
          link.href = finalDataUrl
          link.click()
          return
        }

        return finalDataUrl
      } finally {
        clearTiles()
        setIsExporting(false)
      }
    },
    [options.cityId, waitForTiles, clearTiles],
  ) as UseMapExporterReturn['exportImage']

  return { isExporting, exportImage, trackTile }
}

async function composeWithOverlay(
  mapDataUrl: string,
  cssWidth: number,
  cssHeight: number,
  pixelRatio: number,
  data: ItineraryData,
  activeDay: number | null,
  mode: ExportMode,
): Promise<string> {
  const width = Math.floor(cssWidth * pixelRatio)
  const height = Math.floor(cssHeight * pixelRatio)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      drawExportOverlay({ ctx, width, height, data, activeDay, mode })
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load map image'))
    img.src = mapDataUrl
  })
}
