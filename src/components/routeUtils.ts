import type { PathPoint, TransitDetail } from '../types'

type RoutePoint = { point: PathPoint }

/**
 * Current itinerary files attach transit to the destination path point. Older
 * files attach it to the origin instead; a transit value on the first point is
 * the unambiguous signal for that legacy convention.
 */
export function getTransitForSegment(
  routePoints: RoutePoint[],
  segmentIndex: number,
): TransitDetail | undefined {
  const usesOriginConvention = Boolean(routePoints[0]?.point.transit)
  const transitPointIndex = usesOriginConvention ? segmentIndex : segmentIndex + 1
  return routePoints[transitPointIndex]?.point.transit
}
