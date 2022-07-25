import { AbstractControl, ValidatorFn } from '@angular/forms'

import { FeatureCollection, Geometry } from 'geojson'

import { isEmptyInputValue } from '../form/is-empty-input-value'
import { isOnlyGeometryTypes } from './is-only-geometry-types'

export const IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME = 'is-only-geometry-types'

export function isOnlyGeometryTypesValidator(types: Geometry['type'][]): ValidatorFn {
  return (control: AbstractControl) => {
    // Don't need to validate if there isn't a value. Use `Validators.required` for that.
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const value = parseValue(control.value)

    if (value === null) {
      return {
        [IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME]: {
          reason: `Must be a FeatureCollection.`,
        }
      }
    }

    if (!isOnlyGeometryTypes(value, types)) {
      const typesNotAllowed = value.features
        .map(f => f.geometry.type)
        .filter(t => types.indexOf(t) === -1)
      const distinctTypesNotAllowed = Array.from(new Set(typesNotAllowed))
      return {
        [IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME]: {
          reason: `Only geometry type${(types.length === 1 ? '' : 's')} ${types.join(', ')} allowed.`,
          notAllowedGeometryTypesFound: distinctTypesNotAllowed,
        }
      }
    }

    return null
  }
}

/**
 * Parses the value to a FeatureCollection object or null if it is not a
 * FeatureCollection.
 */
function parseValue(value: any): FeatureCollection | null {
  const _value = parseStringValue(value)
  if (isFeatureCollectionValue(_value)) {
    return _value
  }
  return null
}

/**
 * Tries to parse the value to an object, in case the value is a stringified
 * json.
 */
function parseStringValue(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return value
}

/**
 * Checks if the value is a FeatureCollection.
 *
 * NOTE: This is not a thorough FeatureCollection check. It only checks that the
 * value is an object resembling a GeoJSON.FeatureCollection, enough for the
 * validator.
 */
function isFeatureCollectionValue(value: any): value is FeatureCollection {
  if (value === undefined || value === null) {
    return false
  }
  return value.type === 'FeatureCollection' && Array.isArray(value.features)
}
