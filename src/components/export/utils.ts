export type ExportMode = 'panorama' | 'day-horizontal' | 'day-vertical' | 'itinerary-vertical'

export const MODE_LABELS: Record<ExportMode, string> = {
  panorama: '全景横图 (2560×1440)',
  'day-horizontal': '当天横图 (2560×1440)',
  'day-vertical': '当天竖图 (1080px 宽)',
  'itinerary-vertical': '完整竖图 (1080px 宽)',
}

export interface ExportConfig {
  cssWidth: number
  cssHeight: number
  pixelRatio: number
}

export const EXPORT_CONFIGS: Record<ExportMode, ExportConfig> = {
  panorama: { cssWidth: 1280, cssHeight: 720, pixelRatio: 2 },
  'day-horizontal': { cssWidth: 1280, cssHeight: 720, pixelRatio: 2 },
  'day-vertical': { cssWidth: 540, cssHeight: -1, pixelRatio: 2 },
  'itinerary-vertical': { cssWidth: 540, cssHeight: -1, pixelRatio: 2 },
}

export function buildFileName(cityId: string, mode: ExportMode, day?: number | null): string {
  const date = new Date().toISOString().slice(0, 10)
  const daySuffix = day != null ? `-day${day + 1}` : ''
  return `${cityId}-travel-${mode}${daySuffix}-${date}.png`
}
