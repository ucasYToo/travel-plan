import L from 'leaflet'
import type { LocationOrGroup, LocationGroup } from '../types'

export function isLocationGroup(loc: LocationOrGroup): loc is LocationGroup {
  return loc.type === 'group' || loc.type === 'hotel_group'
}

export function createCustomMarker(location: LocationOrGroup, badge?: string, showName = false, overrideColor?: string): L.DivIcon {
  const isGroup = isLocationGroup(location)
  const isHotelGroup = location.type === 'hotel_group'
  const size = isGroup ? 40 : 24
  const svgColor = overrideColor || location.color

  const paperColor = '#FFF8FA'

  const orderBadge = '';

  const markerBody = isHotelGroup
    ? `<div style="width:40px;height:40px;background:${svgColor};border-radius:50%;border:3px solid ${paperColor};box-shadow:0 3px 10px rgba(244,164,184,0.35);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#fff">住</div>`
    : isGroup
      ? `<div style="width:40px;height:40px;background:${svgColor};border-radius:50%;border:3px solid ${paperColor};box-shadow:0 3px 10px rgba(244,164,184,0.35);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fff">${badge || '●'}</div>`
      : `<div style="width:24px;height:24px;background:${svgColor};border-radius:50%;border:2px solid ${paperColor};box-shadow:0 3px 10px rgba(244,164,184,0.30);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600;">${badge || '•'}</div>`

  const nameLabel = showName
    ? `<div style="margin-top:4px;padding:2px 10px;background:rgba(255,248,250,0.95);border:1px solid #FCE7EF;border-radius:9999px;font-size:10px;font-weight:600;color:#2A2A2A;white-space:nowrap;box-shadow:0 1px 4px rgba(244,164,184,0.10)">${location.name}</div>`
    : ''

  const iconHtml = `
    <div style="display:flex;flex-direction:column;align-items:center" class="marker-wrap">
      <div style="color: ${svgColor}; position:relative; display:inline-block" class="marker-pop">${markerBody}${orderBadge}</div>
      ${nameLabel}
    </div>
  `

  const anchorShift = !isGroup && badge ? 8 : 0
  const labelHeight = showName ? 20 : 0

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size + labelHeight],
    iconAnchor: [size / 2 + anchorShift, size - anchorShift / 2 + labelHeight],
    popupAnchor: [0, -size + anchorShift / 2]
  })
}

export function createRouteLabelIcon(text: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="max-width:180px;padding:4px 10px;background:rgba(255,248,250,0.95);border:1px solid #FCE7EF;border-radius:9999px;font-size:11px;font-weight:600;color:#2A2A2A;box-shadow:0 1px 4px rgba(244,164,184,0.10);white-space:normal;word-break:break-word;text-align:center;line-height:1.3">${text}</div>`,
    className: 'route-label',
    iconSize: [180, 40],
    iconAnchor: [90, 20]
  })
}
