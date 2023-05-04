import { AbstractControl, ValidatorFn } from '@angular/forms'

import { FeatureCollection } from 'geojson'

import { isEmptyInputValue } from '../form/is-empty-input-value'
import { notNullOrUndefined } from '../not-null-or-undefined'
import { coerceFeatureCollection } from './coerce-feature-collection'

export const MIN_MAX_POINTS_VALIDATOR_NAME = 'min-max-points'

export function minMaxPointsValidator(min: number | undefined = 3, max?: number | undefined): ValidatorFn {
  return (control: AbstractControl) => {
    // Don't need to validate if there isn't a value. Use `Validators.required` for that.
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const value = coerceFeatureCollection(control.value)

    if (value === null) {
      return null
    }

    if (collectionViolatesMinMax(value, min, max)) {
      const reason = notNullOrUndefined(max)
        ? `A polygon must have between ${min} and ${max} points.`
        : `A polygon must have at least ${min} points.`
      return {
        [MIN_MAX_POINTS_VALIDATOR_NAME]: {
          reason
        }
      }
    }
    return null
  }
}

/**
 * Checks if a FeatureCollection contains any geometries with an incomplete polygon.
 *
 * NOTE: Does not consider GeometryCollection.
 */
 function collectionViolatesMinMax(featureCollection: FeatureCollection, min: number, max: number | undefined): boolean {
  for (const f of featureCollection.features) {
    if (f.geometry.type === 'Polygon') {
      if (polygonViolatesMinMax(f.geometry.coordinates[0].length, min, max)) {
        return true
      }
    } else if (f.geometry.type === 'MultiPolygon') {
      for (const coords of f.geometry.coordinates) {
        if (polygonViolatesMinMax(coords[0].length, min, max)) {
          return true
        }
      }
    }
  }

  return false
}

function polygonViolatesMinMax(coordinateLength: number, min: number, max: number | undefined): boolean {
  if (coordinateLength < min || (notNullOrUndefined(max) && max > min && coordinateLength > max)) {
    return true
  }

  return false
}
