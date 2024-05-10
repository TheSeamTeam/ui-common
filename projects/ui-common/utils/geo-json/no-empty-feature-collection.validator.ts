import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '../form/is-empty-input-value'
import { coerceFeatureCollection } from './coerce-feature-collection'

export const NO_EMPTY_FEATURE_COLLECTION_VALIDATOR_NAME = 'no-empty-feature-collection'

export function noEmptyFeatureCollectionValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    // Don't need to validate if there isn't a value. Use `Validators.required` for that.
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const value = coerceFeatureCollection(control.value)

    if (value === null) {
      return null
    }

    if (value.features.length === 0) {
      return {
        [NO_EMPTY_FEATURE_COLLECTION_VALIDATOR_NAME]: {
          reason: `FeatureCollection must have a value.`,
        }
      }
    }

    return null
  }
}
