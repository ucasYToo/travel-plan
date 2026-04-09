/**
 * 瓦片源配置：根据城市所在国家选择不同底图
 * - CN: 高德地图（国内访问友好）
 * - 其他: CARTO CDN（国际化）
 */

export interface TileSource {
  url: string
  subdomains: string
  attribution: string
}

export function getTileSource(): TileSource {
  return {
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }
}

export function getChinaTileSource(): TileSource {
  return {
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: '1234',
    attribution:
      '&copy; <a href="https://www.amap.com/">高德地图</a>',
  }
}
