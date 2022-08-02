import { FormControl } from '@angular/forms'
import {
  FeatureCollection,
} from 'geojson'

import { noKinksValidator } from './no-kinks.validator'

describe('noKinksValidator', () => {
  it('should be valid if value is null', () => {
    const control = new FormControl(null, [ noKinksValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is undefined', () => {
    const control = new FormControl(undefined, [ noKinksValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is empty string', () => {
    const control = new FormControl('', [ noKinksValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is a value that is not a FeatureCollection', () => {
    const control = new FormControl('a', [ noKinksValidator() ])
    expect(control.valid).toBe(true)
  })

  describe('object value', () => {
    it('should be valid if value is a FeatureCollection, without any kinks', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
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
      const control = new FormControl(featureCollection, [ noKinksValidator() ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if value is a FeatureCollection, with kinks', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [ 0, 0 ],
                  [ 0, 3 ],
                  [ 3, 0 ],
                  [ 2, 0 ],
                  [ 0, 2 ], // Causes kink
                  [ 0, 0 ],
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new FormControl(featureCollection, [ noKinksValidator() ])
      expect(control.valid).toBe(false)
    })
  })

  describe('string value', () => {
    it('should be valid if value is a FeatureCollection', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
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
      const control = new FormControl(value, [ noKinksValidator() ])
      expect(control.valid).toBe(true)
    })
  })

  it('should not be valid if value is a FeatureCollection, with kinks', () => {
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [ 0, 0 ],
                [ 0, 3 ],
                [ 3, 0 ],
                [ 2, 0 ],
                [ 0, 2 ], // Causes kink
                [ 0, 0 ],
              ]
            ],
          },
          properties: { },
        },
      ],
    }
    const value = JSON.stringify(featureCollection)
    const control = new FormControl(value, [ noKinksValidator() ])
    expect(control.valid).toBe(false)
  })
})
