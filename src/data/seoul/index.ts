import type { ItineraryData } from '../../types'
import { seoulLocations } from './locations'
import { seoulDays } from './days'

/**
 * 首尔行程数据
 * 完全自描述，组件可直接渲染，无需计算
 */
export const seoulTrip: ItineraryData = {
  metadata: {
    title: '首尔旅行攻略',
    subtitle: '麻浦格莱德2晚 + 梨泰院Aank3晚 · 6日往返'
  },
  locations: seoulLocations,
  days: seoulDays
}

// 保持向后兼容的导出（如需）
export const SEOUL_LOCATIONS = seoulLocations
export const SEOUL_DAYS = seoulDays

export default seoulTrip
