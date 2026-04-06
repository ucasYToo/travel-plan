// 旅行地图应用 - 通用类型定义
// 设计原则: 数据自包含，组件纯渲染，无需计算层

/**
 * 具体地点类型
 * 商圈/酒店内的实际目的地（景点、餐厅、店铺等）
 */
export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  color: string
  type: 'spot'
  description?: string
  parentId: string   // 所属商圈/酒店组ID
  address?: string   // 具体地址，可复制到地图/打车软件
}

/**
 * 地点组/商圈类型
 * 支持地点的层级关系，如酒店商圈包含周边餐厅
 */
export interface LocationGroup {
  id: string
  name: string
  lat: number
  lng: number
  color: string
  type: 'group' | 'hotel_group'
  description?: string
  address?: string   // 具体地址（酒店组使用）
  children: string[]  // 子地点ID列表
}

/**
 * 地点或组类型的联合类型
 */
export type LocationOrGroup = Location | LocationGroup

/**
 * 交通步骤
 * 单段交通的详细信息
 */
export interface TransitStep {
  mode: 'walk' | 'subway' | 'bus' | 'train' | 'taxi' | 'airport'
  line?: string
  from: string
  to: string
  duration: string
  distance?: string
  instruction: string
}

/**
 * 交通详情
 * 两点之间的完整交通方案
 */
export interface TransitDetail {
  distance: string
  duration: string
  fare?: string
  steps: TransitStep[]
  startName: string
  endName: string
}

/**
 * 备注分类
 */
export type NoteCategory = 'food' | 'shopping' | 'tips' | 'other'

/**
 * 备注项
 * 地点的备注信息（吃什么、买什么等）
 */
export interface NoteItem {
  category: NoteCategory
  content: string
}

/**
 * 路径点
 * 包含完整的显示信息，无需计算
 */
export interface PathPoint {
  locationId: string      // 关联的地点ID
  label: string          // 显示标签 (如 "地铁6号线 · 约20分钟")
  transit?: TransitDetail // 交通详情（可选）
  isHotel?: boolean      // 是否是酒店（用于特殊标记）
  notes?: NoteItem[]     // 地点备注（可选）
}

/**
 * 单日行程
 * 包含完整路径，起点和终点都在 path 数组中
 */
export interface DayPlan {
  day: number            // 第几天 (1-based: 1=第一天, 2=第二天...)
  date?: string          // 具体日期 (ISO格式: "2026-04-29")，用于显示
  title: string          // 标题 (如 "西线双城记"，不含日期前缀)
  note: string           // 备注说明
  baseHotelId: string    // 当日住宿酒店ID
  path: PathPoint[]      // 完整路径点数组 [起点, ..., 终点]
}

/**
 * 行程元数据
 */
export interface ItineraryMetadata {
  title: string          // 主标题 (如 "首尔旅行攻略")
  subtitle: string       // 副标题 (如 "麻浦2晚 + 梨泰院3晚 · 6日往返")
  startDate?: string     // 开始日期 (可选)
  endDate?: string       // 结束日期 (可选)
}

/**
 * 完整行程数据
 * 包含渲染所需的所有信息
 */
export interface ItineraryData {
  metadata: ItineraryMetadata
  locations: Record<string, LocationOrGroup>  // 所有地点字典，按ID索引
  days: DayPlan[]                             // 每日行程数组
}

/**
 * 支持导出的城市数据模块
 */
export interface CityItineraryModule {
  metadata: ItineraryMetadata
  locations: Record<string, LocationOrGroup>
  days: DayPlan[]
}

/**
 * 城市选项
 */
export interface CityOption {
  id: string
  name: string
  flag: string
}
