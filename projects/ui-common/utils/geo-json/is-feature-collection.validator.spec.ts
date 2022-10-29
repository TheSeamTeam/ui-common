import { UntypedFormControl } from '@angular/forms'

import {
  FeatureCollection,
} from 'geojson'

import { isFeatureCollectionValidator, IS_FEATURE_COLLECTION_VALIDATOR_NAME } from './is-feature-collection.validator'

describe('isOnlyGeometryTypesValidator', () => {
  it('should be valid if value is null', () => {
    const control = new UntypedFormControl(null, [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is undefined', () => {
    const control = new UntypedFormControl(undefined, [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is empty string', () => {
    const control = new UntypedFormControl('', [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should not be valid if value is a value that is not a FeatureCollection', () => {
    const control = new UntypedFormControl('a', [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(false)
    expect(control.errors).not.toBeNull()
    // tslint:disable-next-line: no-non-null-assertion
    expect(control.errors![IS_FEATURE_COLLECTION_VALIDATOR_NAME].reason).toBe(`Must be a FeatureCollection.`)
  })

  describe('object value', () => {
    it('should be valid if value is a FeatureCollection', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const control = new UntypedFormControl(featureCollection, [ isFeatureCollectionValidator() ])
      expect(control.valid).toBe(true)
    })
  })

  describe('string value', () => {
    it('should be valid if value is a FeatureCollection', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ isFeatureCollectionValidator() ])
      expect(control.valid).toBe(true)
    })
  })

})
