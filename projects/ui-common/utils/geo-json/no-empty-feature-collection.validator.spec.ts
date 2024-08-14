import { UntypedFormControl } from '@angular/forms'

import {
  FeatureCollection,
} from 'geojson'
import { NO_EMPTY_FEATURE_COLLECTION_VALIDATOR_NAME, noEmptyFeatureCollectionValidator } from './no-empty-feature-collection.validator'


describe('isOnlyGeometryTypesValidator', () => {
  it('should be valid if value is null', () => {
    const control = new UntypedFormControl(null, [ noEmptyFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is undefined', () => {
    const control = new UntypedFormControl(undefined, [ noEmptyFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is empty string', () => {
    const control = new UntypedFormControl('', [ noEmptyFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is not a FeatureCollection', () => {
    const control = new UntypedFormControl('abc', [ noEmptyFeatureCollectionValidator() ])
    expect(control.valid).toBe(true)
  })

  describe('object value', () => {
    it('should not be valid if value is a FeatureCollection with empty features array', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const control = new UntypedFormControl(featureCollection, [ noEmptyFeatureCollectionValidator() ])
      expect(control.valid).toBe(false)
      expect(control.errors).not.toBeNull()
      expect(control.errors !== null && control.errors[NO_EMPTY_FEATURE_COLLECTION_VALIDATOR_NAME].reason).toBe(`FeatureCollection must have a value.`)
    })
  })

  describe('string value', () => {
    it('should not be valid if value is a stringified FeatureCollection with empty features array', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ noEmptyFeatureCollectionValidator() ])
      expect(control.valid).toBe(false)
      expect(control.errors).not.toBeNull()
      expect(control.errors !== null && control.errors[NO_EMPTY_FEATURE_COLLECTION_VALIDATOR_NAME].reason).toBe(`FeatureCollection must have a value.`)
    })
  })

  describe('object value', () => {
    it('should be valid if value is a FeatureCollection and features array has at least one value', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [ 0, 0 ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ noEmptyFeatureCollectionValidator() ])
      expect(control.valid).toBe(true)
    })
  })

  describe('string value', () => {
    it('should be valid if value is a stringified FeatureCollection and features array has at least one value', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [ 0, 0 ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ noEmptyFeatureCollectionValidator() ])
      expect(control.valid).toBe(true)
    })
  })
})
