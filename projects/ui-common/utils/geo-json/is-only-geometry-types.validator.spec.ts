import { UntypedFormControl } from '@angular/forms'
import {
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson'

import { isOnlyGeometryTypesValidator, IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME } from './is-only-geometry-types.validator'

describe('isOnlyGeometryTypesValidator', () => {
  it('should be valid if value is null', () => {
    const control = new UntypedFormControl(null, [ isOnlyGeometryTypesValidator([]) ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is undefined', () => {
    const control = new UntypedFormControl(undefined, [ isOnlyGeometryTypesValidator([]) ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is empty string', () => {
    const control = new UntypedFormControl('', [ isOnlyGeometryTypesValidator([]) ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is a value that is not a FeatureCollection', () => {
    const control = new UntypedFormControl('a', [ isOnlyGeometryTypesValidator([]) ])
    expect(control.valid).toBe(true)
  })

  describe('object value', () => {
    it('should be valid if value is an empty FeatureCollection', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const control = new UntypedFormControl(featureCollection, [ isOnlyGeometryTypesValidator([]) ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if value is a FeatureCollection containing a type that isn\'t specified', () => {
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
      const control = new UntypedFormControl(featureCollection, [ isOnlyGeometryTypesValidator([ 'Polygon' ]) ])
      expect(control.valid).toBe(false)
      expect(control.errors).not.toBeNull()
      expect(control.errors !== null && control?.errors[IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME].reason).toBe(`Only geometry type Polygon allowed.`)
    })

    it('should be valid if value is a FeatureCollection containing type that is specified', () => {
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
      const control = new UntypedFormControl(featureCollection, [ isOnlyGeometryTypesValidator([ 'Point' ]) ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if value is a FeatureCollection containing any type that isn\'t specified', () => {
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
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [ 0, 0 ],
                  [ 0, 1 ],
                  [ 1, 1 ],
                  [ 1, 0 ],
                  [ 0, 0 ],
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ isOnlyGeometryTypesValidator([ 'Point' ]) ])
      expect(control.valid).toBe(false)
      expect(control.errors).not.toBeNull()
      expect(control.errors !== null && control.errors[IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME].reason).toBe(`Only geometry type Point allowed.`)
      expect(control.errors !== null && control.errors[IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME].notAllowedGeometryTypesFound).toStrictEqual([ 'Polygon' ])
    })
  })

  describe('string value', () => {
    it('should be valid if value is an empty FeatureCollection', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ isOnlyGeometryTypesValidator([]) ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if value is a FeatureCollection containing a type that isn\'t specified', () => {
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
      const control = new UntypedFormControl(value, [ isOnlyGeometryTypesValidator([ 'Polygon' ]) ])
      expect(control.valid).toBe(false)
      expect(control.errors).not.toBeNull()
      expect(control.errors !== null && control.errors[IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME].reason).toBe(`Only geometry type Polygon allowed.`)
    })

    it('should be valid if value is a FeatureCollection containing type that is specified', () => {
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
      const control = new UntypedFormControl(value, [ isOnlyGeometryTypesValidator([ 'Point' ]) ])
      expect(control.valid).toBe(true)
    })
  })

  it('should not be valid if value is a FeatureCollection containing any type that isn\'t specified', () => {
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
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [ 0, 0 ],
                [ 0, 1 ],
                [ 1, 1 ],
                [ 1, 0 ],
                [ 0, 0 ],
              ]
            ],
          },
          properties: { },
        },
      ],
    }
    const value = JSON.stringify(featureCollection)
    const control = new UntypedFormControl(value, [ isOnlyGeometryTypesValidator([ 'Point' ]) ])
    expect(control.valid).toBe(false)
    expect(control.errors).not.toBeNull()
    expect(control.errors !== null && control.errors[IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME].reason).toBe(`Only geometry type Point allowed.`)
    expect(control.errors !== null && control.errors[IS_ONLY_GEOMETRY_TYPES_VALIDATOR_NAME].notAllowedGeometryTypesFound).toStrictEqual([ 'Polygon' ])
  })
})
