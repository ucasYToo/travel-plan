import { describe, it, expect } from 'vitest'
import { itinerarySchema } from './schema'
import seoulJson from './cities/seoul.json'

const CITY_CASES = [
  { id: 'seoul', data: seoulJson },
]

for (const city of CITY_CASES) {
  describe(`${city.id} city data validation`, () => {
    const parsed = itinerarySchema.parse(city.data)
    const { locations, days } = parsed

    it('passes zod schema validation', () => {
      expect(parsed).toBeDefined()
      expect(parsed.metadata).toBeDefined()
      expect(Object.keys(parsed.locations).length).toBeGreaterThan(0)
      expect(parsed.days.length).toBeGreaterThan(0)
    })

    it('day 2 onwards path starts with a hotel', () => {
      for (const day of days) {
        if (day.day <= 1) continue
        const firstPoint = day.path[0]
        expect(firstPoint, `Day ${day.day} has empty path`).toBeDefined()
        const firstLoc = locations[firstPoint.locationId]
        expect(firstLoc, `Day ${day.day} path[0] ${firstPoint.locationId} not found`).toBeDefined()
        expect(firstLoc.type, `Day ${day.day} path[0] should be a hotel_group`).toBe('hotel_group')

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
      for (const day of days) {
        const lastPoint = day.path[day.path.length - 1]
        const loc = locations[lastPoint.locationId]
        if (loc && loc.type === 'hotel_group') {
          expect(lastPoint.isHotel, `Day ${day.day} last point ${lastPoint.locationId} should have isHotel=true`).toBe(true)
        }
      }
    })

    it('every transit segment belongs to a valid location pair', () => {
      for (const day of days) {
        for (let i = 1; i < day.path.length; i++) {
          const prev = day.path[i - 1]
          const curr = day.path[i]
          const prevLoc = locations[prev.locationId]
          const currLoc = locations[curr.locationId]
          expect(prevLoc, `Day ${day.day} path[${i - 1}] ${prev.locationId} not found in locations`).toBeDefined()
          expect(currLoc, `Day ${day.day} path[${i}] ${curr.locationId} not found in locations`).toBeDefined()

          if (curr.transit) {
            expect(curr.label, `Day ${day.day} path[${i}] ${curr.locationId} has transit but no label`).toBeTruthy()
          }
        }
      }
    })

    it('path only references existing locations', () => {
      for (const day of days) {
        for (const point of day.path) {
          expect(locations[point.locationId], `Day ${day.day} references unknown locationId: ${point.locationId}`).toBeDefined()
        }
      }
    })

    it('baseHotelId references a hotel_group', () => {
      for (const day of days) {
        const hotel = locations[day.baseHotelId]
        expect(hotel, `Day ${day.day} baseHotelId ${day.baseHotelId} not found`).toBeDefined()
        expect(hotel.type, `Day ${day.day} baseHotelId ${day.baseHotelId} should be hotel_group`).toBe('hotel_group')
      }
    })
  })
}
