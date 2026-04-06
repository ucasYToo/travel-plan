import { describe, it, expect } from 'vitest'
import { seoulDays } from './days'
import { seoulLocations } from './locations'

describe('seoulDays data consistency', () => {
  it('day 2 onwards path starts with a hotel', () => {
    for (const day of seoulDays) {
      if (day.day <= 1) continue
      const firstPoint = day.path[0]
      expect(firstPoint, `Day ${day.day} has empty path`).toBeDefined()
      const firstLoc = seoulLocations[firstPoint.locationId]
      expect(firstLoc, `Day ${day.day} path[0] ${firstPoint.locationId} not found`).toBeDefined()
      expect(firstLoc.type, `Day ${day.day} path[0] should be a hotel_group`).toBe('hotel_group')

      // Most days: path[0] must be baseHotelId.
      // Moving days exception: path[0] can be previous hotel if path[1] is baseHotelId.
      if (firstPoint.locationId === day.baseHotelId) {
        expect(firstPoint.isHotel, `Day ${day.day} path[0] should have isHotel=true`).toBe(true)
      } else {
        const secondPoint = day.path[1]
        expect(secondPoint, `Day ${day.day} moving day should have path[1]`).toBeDefined()
        expect(secondPoint.locationId, `Day ${day.day} moving day path[1] should be baseHotelId ${day.baseHotelId}`)
          .toBe(day.baseHotelId)
        expect(secondPoint.isHotel, `Day ${day.day} moving day path[1] should have isHotel=true`).toBe(true)
      }
    }
  })

  it('every day path ends at a location with isHotel when the last point is a hotel', () => {
    for (const day of seoulDays) {
      const lastPoint = day.path[day.path.length - 1]
      const loc = seoulLocations[lastPoint.locationId]
      if (loc && loc.type === 'hotel_group') {
        expect(lastPoint.isHotel, `Day ${day.day} last point ${lastPoint.locationId} should have isHotel=true`).toBe(true)
      }
    }
  })

  it('every transit segment belongs to a valid location pair', () => {
    for (const day of seoulDays) {
      for (let i = 1; i < day.path.length; i++) {
        const prev = day.path[i - 1]
        const curr = day.path[i]
        const prevLoc = seoulLocations[prev.locationId]
        const currLoc = seoulLocations[curr.locationId]
        expect(prevLoc, `Day ${day.day} path[${i - 1}] ${prev.locationId} not found in locations`).toBeDefined()
        expect(currLoc, `Day ${day.day} path[${i}] ${curr.locationId} not found in locations`).toBeDefined()

        // If current point has transit, label should also exist
        if (curr.transit) {
          expect(curr.label, `Day ${day.day} path[${i}] ${curr.locationId} has transit but no label`).toBeTruthy()
        }
      }
    }
  })

  it('path only references existing locations', () => {
    for (const day of seoulDays) {
      for (const point of day.path) {
        expect(seoulLocations[point.locationId], `Day ${day.day} references unknown locationId: ${point.locationId}`).toBeDefined()
      }
    }
  })

  it('baseHotelId references a hotel_group', () => {
    for (const day of seoulDays) {
      const hotel = seoulLocations[day.baseHotelId]
      expect(hotel, `Day ${day.day} baseHotelId ${day.baseHotelId} not found`).toBeDefined()
      expect(hotel.type, `Day ${day.day} baseHotelId ${day.baseHotelId} should be hotel_group`).toBe('hotel_group')
    }
  })
})
