import { AbstractControl, ValidatorFn } from '@angular/forms'

import kinks from '@turf/kinks'
import { Feature, FeatureCollection } from 'geojson'

import { isEmptyInputValue } from '../form/is-empty-input-value'

const kinkableGeometryTypes = [ 'LineString', 'MultiLineString', 'MultiPolygon', 'Polygon' ]

export const NO_KINKS_VALIDATOR_NAME = 'no-kinks'

export function noKinksValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    // Don't need to validate if there isn't a value. Use `Validators.required` for that.
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const value = parseValue(control.value)

    if (value === null) {
      return null
    }

    const kinksFound: { feature: Feature, kinks: FeatureCollection }[] = []
    for (const f of value.features) {
      if (kinkableGeometryTypes.indexOf(f.geometry.type) !== -1) {
        const _kinks = kinks(f as any)
        if (_kinks.features.length > 0) {
          kinksFound.push({
            feature: f,
            kinks: _kinks,
          })
        }
      }
    }

    if (kinksFound.length > 0) {
      return {
        [NO_KINKS_VALIDATOR_NAME]: {
          reason: 'Paths should not intersect themself.',
          featuresWithKink: kinksFound,
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
