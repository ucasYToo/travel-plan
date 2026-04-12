import seoulJson from './cities/seoul.json'
import chengduJson from './cities/chengdu.json'
import type { ItineraryData, CityOption } from '../types'

export const CITIES: Record<string, ItineraryData> = {
  seoul: seoulJson as ItineraryData,
  chengdu: chengduJson as ItineraryData,
}

export const CITY_OPTIONS: CityOption[] = [
  { id: 'seoul', name: '首尔', flag: '🇰🇷' },
  { id: 'chengdu', name: '成都', flag: '🇨🇳' },
]

export function getCityData(cityId: string): ItineraryData | null {
  return CITIES[cityId] || null
}

export function getCityName(cityId: string): string {
  const city = CITY_OPTIONS.find(c => c.id === cityId)
  return city?.name || cityId
}

export const DEFAULT_CITY = 'seoul'
