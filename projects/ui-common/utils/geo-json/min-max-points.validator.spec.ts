import { UntypedFormControl } from '@angular/forms'
import {
  FeatureCollection,
} from 'geojson'

import { minMaxPointsValidator } from './min-max-points.validator'

describe('minMaxPointsValidator', () => {
  it('should be valid if value is null', () => {
    const control = new UntypedFormControl(null, [ minMaxPointsValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is undefined', () => {
    const control = new UntypedFormControl(undefined, [ minMaxPointsValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is empty string', () => {
    const control = new UntypedFormControl('', [ minMaxPointsValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is a value that is not a FeatureCollection', () => {
    const control = new UntypedFormControl('a', [ minMaxPointsValidator() ])
    expect(control.valid).toBe(true)
  })

  describe('object value', () => {
    it('should be valid if value is a FeatureCollection, with polygon coordinate length falling within parameters', () => {
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
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(true)
    })

    it('should be valid if value is a FeatureCollection, with all polygon coordinate lengths falling within parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ],
                [
                  [
                    [ 2, 2 ],
                    [ 2, 3 ],
                    [ 3, 3 ],
                    [ 2, 2 ]
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(true)
    })

    it('should be valid if value is a FeatureCollection, with polygon coordinate length falling within custom parameters', () => {
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
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(true)
    })

    it('should be valid if value is a FeatureCollection, with all polygon coordinate lengths falling within custom parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                  ]
                ],
                [
                  [
                    [ 2, 2 ],
                    [ 2, 3 ],
                    [ 3, 3 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if value is a FeatureCollection, with polygon coordinate length not falling within parameters', () => {
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
                  [ 0, 0 ],
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with any polygon coordinate length not falling within parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ],
                [
                  [
                    [ 0, 0 ],
                    [ 0, 0 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with polygon coordinate length not falling within custom parameters', () => {
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
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator(6) ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with any polygon coordinate length not falling within custom parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator(6) ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with polygon coordinate length not falling within custom parameters', () => {
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
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with any polygon coordinate length not falling within custom parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(false)
    })
  })

  describe('string value', () => {
    it('should be valid if value is a FeatureCollection, with polygon coordinate length falling within parameters', () => {
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
      const control = new UntypedFormControl(value, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(true)
    })

    it('should be valid if value is a FeatureCollection, with all polygon coordinate lengths falling within parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ],
                [
                  [
                    [ 2, 2 ],
                    [ 2, 3 ],
                    [ 3, 3 ],
                    [ 2, 2 ]
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(true)
    })

    it('should be valid if value is a FeatureCollection, with polygon coordinate length falling within custom parameters', () => {
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
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(true)
    })

    it('should be valid if value is a FeatureCollection, with all polygon coordinate lengths falling within custom parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                  ]
                ],
                [
                  [
                    [ 2, 2 ],
                    [ 2, 3 ],
                    [ 3, 3 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if value is a FeatureCollection, with polygon coordinate length not falling within parameters', () => {
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
                  [ 0, 0 ],
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with any polygon coordinate length not falling within parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ],
                [
                  [
                    [ 0, 0 ],
                    [ 0, 0 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ minMaxPointsValidator() ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with polygon coordinate length not falling within custom parameters', () => {
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
      const control = new UntypedFormControl(value, [ minMaxPointsValidator(6) ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with any polygon coordinate length not falling within custom parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ minMaxPointsValidator(6) ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with polygon coordinate length not falling within custom parameters', () => {
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
      const control = new UntypedFormControl(value, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(false)
    })

    it('should not be valid if value is a FeatureCollection, with any polygon coordinate length not falling within custom parameters', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [ 0, 0 ],
                    [ 0, 1 ],
                    [ 1, 1 ],
                    [ 1, 0 ],
                    [ 0, 0 ],
                  ]
                ]
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ minMaxPointsValidator(2, 3) ])
      expect(control.valid).toBe(false)
    })
  })
})
