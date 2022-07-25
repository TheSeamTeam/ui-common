import { FormControl } from '@angular/forms'
import {
  FeatureCollection,
} from 'geojson'

import { isFeatureCollectionValidator, IS_FEATURE_COLLECTION_VALIDATOR_NAME } from './is-feature-collection.validator'

describe('isOnlyGeometryTypesValidator', () => {
  it('should be valid if value is null', () => {
    const control = new FormControl(null, [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is undefined', () => {
    const control = new FormControl(undefined, [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is empty string', () => {
    const control = new FormControl('', [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should not be valid if value is a value that is not a FeatureCollection', () => {
    const control = new FormControl('a', [ isFeatureCollectionValidator() ])
    expect(control.valid).toBe(false)
    expect(control.errors).not.toBeNull()
    expect(control.errors![IS_FEATURE_COLLECTION_VALIDATOR_NAME].reason).toBe(`Must be a FeatureCollection.`)
  })

  describe('object value', () => {
    it('should be valid if value is a FeatureCollection', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const control = new FormControl(featureCollection, [ isFeatureCollectionValidator() ])
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
      const control = new FormControl(value, [ isFeatureCollectionValidator() ])
      expect(control.valid).toBe(true)
    })
  })

})
