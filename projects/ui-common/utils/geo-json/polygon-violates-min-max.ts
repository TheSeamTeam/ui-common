import { notNullOrUndefined } from '../not-null-or-undefined'

/**
 * Checks if a single polygon ring's coordinate count violates the given
 * min/max point bounds. `max` is only applied when it is greater than `min`.
 */
export function polygonViolatesMinMax(
  coordinateLength: number,
  min: number,
  max?: number | undefined,
): boolean {
  if (
    coordinateLength < min ||
    (notNullOrUndefined(max) && max > min && coordinateLength > max)
  ) {
    return true
  }

  return false
}
