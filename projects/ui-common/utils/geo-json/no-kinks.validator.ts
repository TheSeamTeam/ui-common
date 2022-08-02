import { AbstractControl, ValidatorFn } from '@angular/forms'

import kinks from '@turf/kinks'
import { Feature, FeatureCollection } from 'geojson'

import { isEmptyInputValue } from '../form/is-empty-input-value'
import { coerceFeatureCollection } from './coerce-feature-collection'

const kinkableGeometryTypes = [ 'LineString', 'MultiLineString', 'MultiPolygon', 'Polygon' ]

export const NO_KINKS_VALIDATOR_NAME = 'no-kinks'

export function noKinksValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    // Don't need to validate if there isn't a value. Use `Validators.required` for that.
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const value = coerceFeatureCollection(control.value)

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
