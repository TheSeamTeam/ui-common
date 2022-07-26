import { AbstractControl, ValidatorFn } from '@angular/forms'

import { Geometry } from 'geojson'

import { isEmptyInputValue } from '../form/is-empty-input-value'
import { coerceFeatureCollection } from './coerce-feature-collection'
import { isOnlyGeometryTypes } from './is-only-geometry-types'

export const IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME = 'is-only-geometry-types'

export function isOnlyGeometryTypesValidator(types: Geometry['type'][]): ValidatorFn {
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


