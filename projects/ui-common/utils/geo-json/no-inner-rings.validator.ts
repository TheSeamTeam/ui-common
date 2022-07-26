import { AbstractControl, ValidatorFn } from '@angular/forms'

import { FeatureCollection } from 'geojson'

import { isEmptyInputValue } from '../form/is-empty-input-value'
import { coerceFeatureCollection } from './coerce-feature-collection'

export const NO_INNER_RINGS_VALIDATOR_NAME = 'no-inner-rings'

/**
 * Validates that a FeatureCollection does not contain any Polygon with inner
 * rings("holes").
 *
 * NOTE: Only considers Polygon and MultiPolygon. Does not consider
 * GeometryCollection.
 */
export function noInnerRingsValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    // Don't need to validate if there isn't a value. Use `Validators.required` for that.
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const value = coerceFeatureCollection(control.value)

    if (value === null) {
      // If there isn't a FeatureCollection then there is nothing to validate.
      // Use 'isFeatureCollection' to validate the value is a FeatureCollection.
      return null
    }

    if (hasInnerRing(value)) {
      return {
        [NO_INNER_RINGS_VALIDATOR_NAME]: {
          reason: `A shape cannot have an inner ring.`
        }
      }
    }

    return null
  }
}

/**
 * Checks if a FeatureCollection contains any geometries with an inner
 * ring("hole").
 *
 * NOTE: Does not consider GeometryCollection.
 */
function hasInnerRing(featureCollection: FeatureCollection): boolean {
  for (const f of featureCollection.features) {
    // The spec says the right-hand rule must be followed, but also specifies
    // that tools should not reject polygons that do not follow the right-hand
    // rule. It does specify that the first ring must be the exterior ring and
    // the others must be the interior. So, this should be safe to just check
    // if there are multiple rings, instead of checking their winding orders.
    //
    // Polygon spec: https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
    if (f.geometry.type === 'Polygon') {
      if (f.geometry.coordinates.length > 1) {
        return true
      }
    } else if (f.geometry.type === 'MultiPolygon') {
      for (const coords of f.geometry.coordinates) {
        if (coords.length > 1) {
          return true
        }
      }
    }
  }

  return false
}
