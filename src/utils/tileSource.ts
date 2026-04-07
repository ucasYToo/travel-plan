/**
 * 瓦片源配置：z10-z13 使用内联瓦片，z14+ 回退到 CARTO CDN
 * 使用 Fastly CDN 域名（国内可访问）
 */

export function getTileSource() {
  return {
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }
}
