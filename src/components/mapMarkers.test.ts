import { describe, expect, it } from 'vitest'
import { createCustomMarker, createRouteLabelIcon } from './mapMarkers'
import type { Location } from '../types'

const location: Location = {
  id: 'unsafe-name',
  name: '<img src=x onerror=alert(1)>',
  lat: 0,
  lng: 0,
  color: '#E07C96',
  type: 'spot',
  parentId: 'group',
}

describe('map marker rendering', () => {
  it('anchors a spot marker on the center of its circle', () => {
    const icon = createCustomMarker(location, '1', true)

    expect(icon.options.iconAnchor).toEqual([12, 12])
  })

  it('escapes user-provided location and route text', () => {
    const marker = createCustomMarker(location, '<b>1</b>', true)
    const route = createRouteLabelIcon('<script>alert(1)</script>')

    expect(marker.options.html).toContain('&lt;img')
    expect(marker.options.html).not.toContain('<img')
    expect(marker.options.html).toContain('&lt;b&gt;1&lt;/b&gt;')
    expect(route.options.html).toContain('&lt;script&gt;')
    expect(route.options.html).not.toContain('<script>')
    expect(route.options.html).toContain('class="route-label-content"')
  })
})
