import { describe, expect, it } from 'vitest'
import { getTransitForSegment } from './routeUtils'
import type { PathPoint, TransitDetail } from '../types'

const transit: TransitDetail = {
  distance: '10 km',
  duration: '30 min',
  startName: 'A',
  endName: 'B',
  steps: [
    {
      mode: 'subway',
      from: 'A',
      to: 'B',
      duration: '30 min',
      instruction: 'Take the train',
    },
  ],
}

function routePoint(point: PathPoint) {
  return { point }
}

describe('getTransitForSegment', () => {
  it('reads transit from the destination path point', () => {
    const points = [
      routePoint({ locationId: 'a', label: 'start' }),
      routePoint({ locationId: 'b', label: 'subway', transit }),
    ]

    expect(getTransitForSegment(points, 0)).toBe(transit)
  })

  it('supports legacy data that stored transit on the origin point', () => {
    const points = [
      routePoint({ locationId: 'a', label: 'start', transit }),
      routePoint({ locationId: 'b', label: 'walk', transit: { ...transit, duration: '10 min' } }),
      routePoint({ locationId: 'c', label: 'finish' }),
    ]

    expect(getTransitForSegment(points, 0)).toBe(transit)
    expect(getTransitForSegment(points, 1)?.duration).toBe('10 min')
  })

  it('does not reuse the previous segment transit when a destination has none', () => {
    const points = [
      routePoint({ locationId: 'a', label: 'start' }),
      routePoint({ locationId: 'b', label: 'walk', transit }),
      routePoint({ locationId: 'c', label: 'finish' }),
    ]

    expect(getTransitForSegment(points, 1)).toBeUndefined()
  })
})
