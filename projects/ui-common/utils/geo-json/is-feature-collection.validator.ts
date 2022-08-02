import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '../form/is-empty-input-value'
import { coerceFeatureCollection } from './coerce-feature-collection'

export const IS_FEATURE_COLLECTION_VALIDATOR_NAME = 'is-feature-collection'

export function isFeatureCollectionValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    // Don't need to validate if there isn't a value. Use `Validators.required` for that.
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const value = coerceFeatureCollection(control.value)

    if (value === null) {
      return {
        [IS_FEATURE_COLLECTION_VALIDATOR_NAME]: {
          reason: `Must be a FeatureCollection.`,
        }
      }
    }

    return null
  }
}
