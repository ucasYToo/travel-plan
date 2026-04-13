import type { ItineraryData, LocationOrGroup } from '../../types'

const DAY_COLORS = [
  '#F4A4B8',
  '#7AC4A0',
  '#A8D8F0',
  '#F0C878',
  '#C8A8F0',
  '#F0A898',
  '#90D4C8',
  '#F0D4A8',
]

export function getDayColorMap(data: ItineraryData): Record<string, string> {
  const map: Record<string, string> = {}
  data.days.forEach((day, idx) => {
    const color = DAY_COLORS[idx % DAY_COLORS.length]
    day.path.forEach((point) => {
      const loc = data.locations[point.locationId]
      if (!loc) return
      if (!map[loc.id]) {
        map[loc.id] = color
      }
      if (loc.type === 'spot' && loc.parentId && !map[loc.parentId]) {
        map[loc.parentId] = color
      }
    })
  })
  return map
}

export function getDayGroups(
  day: ItineraryData['days'][number],
  data: ItineraryData,
): { id: string; name: string; color: string }[] {
  const groups: { id: string; name: string; color: string }[] = []
  const seen = new Set<string>()
  for (const point of day.path) {
    const loc = data.locations[point.locationId]
    if (!loc || loc.type === 'hotel_group') continue
    if (loc.type === 'group') {
      if (!seen.has(loc.id)) {
        seen.add(loc.id)
        groups.push({ id: loc.id, name: loc.name, color: loc.color })
      }
    } else if (loc.type === 'spot' && loc.parentId) {
      const parent = data.locations[loc.parentId]
      if (parent && parent.type === 'group' && !seen.has(parent.id)) {
        seen.add(parent.id)
        groups.push({ id: parent.id, name: parent.name, color: parent.color })
      }
    }
  }
  return groups
}

function getBoundsArea(coords: { lat: number; lng: number }[]): number {
  const lats = coords.map((c) => c.lat)
  const lngs = coords.map((c) => c.lng)
  const latSpan = Math.max(...lats) - Math.min(...lats)
  const lngSpan = Math.max(...lngs) - Math.min(...lngs)
  return latSpan * lngSpan
}

function findOutliersByAreaReduction(
  coords: { id: string; lat: number; lng: number }[],
): Set<string> {
  const removedIds = new Set<string>()
  const maxIterations = 2

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentCoords = coords.filter((c) => !removedIds.has(c.id))
    if (currentCoords.length < 3) break

    const baseArea = getBoundsArea(currentCoords)
    if (baseArea === 0) break

    let bestReduction = 0
    const toRemove: string[] = []

    // Try removing single points
    currentCoords.forEach((c) => {
      const without = currentCoords.filter((x) => x.id !== c.id)
      const newArea = getBoundsArea(without)
      const reduction = (baseArea - newArea) / baseArea
      if (reduction > bestReduction) {
        bestReduction = reduction
        toRemove.length = 0
        toRemove.push(c.id)
      }
    })

    // Try removing pairs of points (catches nearby outliers like airport + hotel)
    if (currentCoords.length >= 4) {
      for (let i = 0; i < currentCoords.length; i++) {
        for (let j = i + 1; j < currentCoords.length; j++) {
          const dLat = currentCoords[i].lat - currentCoords[j].lat
          const dLng = currentCoords[i].lng - currentCoords[j].lng
          if (Math.hypot(dLat, dLng) > 0.03) continue
          const without = currentCoords.filter(
            (_, idx) => idx !== i && idx !== j,
          )
          const newArea = getBoundsArea(without)
          const reduction = (baseArea - newArea) / baseArea
          if (reduction > bestReduction) {
            bestReduction = reduction
            toRemove.length = 0
            toRemove.push(currentCoords[i].id, currentCoords[j].id)
          }
        }
      }
    }

    if (bestReduction > 0.75) {
      toRemove.forEach((id) => removedIds.add(id))
    } else {
      break
    }
  }

  return removedIds
}

export function excludeOutlierLocations(
  data: ItineraryData,
  activeDay: number | null = null,
): Record<string, LocationOrGroup> {
  if (activeDay !== null) {
    const day = data.days[activeDay]
    if (!day || day.path.length === 0) return data.locations

    // For small day paths, compare against the main cluster of all OTHER locations
    if (day.path.length < 3) {
      const otherLocs = Object.values(data.locations).filter(
        (loc) => !day.path.some((p) => p.locationId === loc.id),
      )
      if (otherLocs.length === 0) return data.locations

      // Clean outliers from otherLocs first so they don't distort the reference bounds
      const otherCoords = otherLocs.map((loc) => ({ id: loc.id, lat: loc.lat, lng: loc.lng }))
      const otherOutliers = findOutliersByAreaReduction(otherCoords)
      const cleanOtherLocs = otherLocs.filter((loc) => !otherOutliers.has(loc.id))
      if (cleanOtherLocs.length === 0) return data.locations

      const otherLats = cleanOtherLocs.map((l) => l.lat)
      const otherLngs = cleanOtherLocs.map((l) => l.lng)
      const latMin = Math.min(...otherLats)
      const latMax = Math.max(...otherLats)
      const lngMin = Math.min(...otherLngs)
      const lngMax = Math.max(...otherLngs)
      const latSpan = latMax - latMin || 0.01
      const lngSpan = lngMax - lngMin || 0.01

      const removedIds = new Set<string>()
      for (const point of day.path) {
        const loc = data.locations[point.locationId]
        if (!loc) continue
        const isFarLat = loc.lat < latMin - latSpan * 0.5 || loc.lat > latMax + latSpan * 0.5
        const isFarLng = loc.lng < lngMin - lngSpan * 0.5 || loc.lng > lngMax + lngSpan * 0.5
        if (isFarLat || isFarLng) {
          removedIds.add(loc.id)
        }
      }

      if (removedIds.size === 0) return data.locations
      const result: Record<string, LocationOrGroup> = {}
      Object.entries(data.locations).forEach(([id, loc]) => {
        if (!removedIds.has(id)) result[id] = loc
      })
      return result
    }

    const coords = day.path
      .map((p) => {
        const loc = data.locations[p.locationId]
        if (!loc) return null
        return { id: loc.id, lat: loc.lat, lng: loc.lng }
      })
      .filter((c): c is { id: string; lat: number; lng: number } => c !== null)

    const removedIds = findOutliersByAreaReduction(coords)
    if (removedIds.size === 0) return data.locations

    const result: Record<string, LocationOrGroup> = {}
    Object.entries(data.locations).forEach(([id, loc]) => {
      if (!removedIds.has(id)) result[id] = loc
    })
    return result
  }

  const all = Object.values(data.locations)
  if (all.length < 3) return data.locations
  const coords = all.map((loc) => ({ id: loc.id, lat: loc.lat, lng: loc.lng }))

  const removedIds = findOutliersByAreaReduction(coords)
  if (removedIds.size === 0) return data.locations

  const result: Record<string, LocationOrGroup> = {}
  Object.entries(data.locations).forEach(([id, loc]) => {
    if (!removedIds.has(id)) result[id] = loc
  })
  return result
}
