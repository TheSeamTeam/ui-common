import { UntypedFormControl } from '@angular/forms'

import {
  FeatureCollection,
} from 'geojson'

import { noInnerRingsValidator } from './no-inner-rings.validator'

describe('noInnerRingsValidator', () => {
  it('should be valid if value is null', () => {
    const control = new UntypedFormControl(null, [ noInnerRingsValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is undefined', () => {
    const control = new UntypedFormControl(undefined, [ noInnerRingsValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is empty string', () => {
    const control = new UntypedFormControl('', [ noInnerRingsValidator() ])
    expect(control.valid).toBe(true)
  })

  it('should be valid if value is a value that is not a FeatureCollection', () => {
    const control = new UntypedFormControl('a', [ noInnerRingsValidator() ])
    expect(control.valid).toBe(true)
  })

  describe('object value', () => {
    it('should be valid if a polygon does not contains an inner ring', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ],
                  [
                    -102.43739650000009,
                    36.978425105732576
                  ],
                  [
                    -100.50380275000009,
                    37.039836225498625
                  ],
                  [
                    -100.53676173437509,
                    38.32657919640774
                  ],
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ],
                ],
              ],
            },
            properties: { },
          },
        ],
      }
      const control = new UntypedFormControl(featureCollection, [ noInnerRingsValidator() ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if a polygon contains an inner ring', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ],
                  [
                    -102.43739650000009,
                    36.978425105732576
                  ],
                  [
                    -100.50380275000009,
                    37.039836225498625
                  ],
                  [
                    -100.53676173437509,
                    38.32657919640774
                  ],
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ]
                ],
                [
                  [
                    -101.02016017187509,
                    38.015644229396216
                  ],
                  [
                    -100.99818751562509,
                    37.354880202002775
                  ],
                  [
                    -102.00892970312509,
                    37.31994026772424
                  ],
                  [
                    -101.95399806250009,
                    37.937703363578606
                  ],
                  [
                    -101.02016017187509,
                    38.015644229396216
                  ]
                ]
              ]
            },
            properties: {}
          }
        ]
      }
      const control = new UntypedFormControl(featureCollection, [ noInnerRingsValidator() ])
      expect(control.valid).toBe(false)
    })
  })

  describe('string value', () => {
    it('should be valid if a polygon does not contains an inner ring', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ],
                  [
                    -102.43739650000009,
                    36.978425105732576
                  ],
                  [
                    -100.50380275000009,
                    37.039836225498625
                  ],
                  [
                    -100.53676173437509,
                    38.32657919640774
                  ],
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ],
                ],
              ],
            },
            properties: { },
          },
        ],
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ noInnerRingsValidator() ])
      expect(control.valid).toBe(true)
    })

    it('should not be valid if a polygon contains an inner ring', () => {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ],
                  [
                    -102.43739650000009,
                    36.978425105732576
                  ],
                  [
                    -100.50380275000009,
                    37.039836225498625
                  ],
                  [
                    -100.53676173437509,
                    38.32657919640774
                  ],
                  [
                    -102.37147853125009,
                    38.24896983908689
                  ]
                ],
                [
                  [
                    -101.02016017187509,
                    38.015644229396216
                  ],
                  [
                    -100.99818751562509,
                    37.354880202002775
                  ],
                  [
                    -102.00892970312509,
                    37.31994026772424
                  ],
                  [
                    -101.95399806250009,
                    37.937703363578606
                  ],
                  [
                    -101.02016017187509,
                    38.015644229396216
                  ]
                ]
              ]
            },
            properties: {}
          }
        ]
      }
      const value = JSON.stringify(featureCollection)
      const control = new UntypedFormControl(value, [ noInnerRingsValidator() ])
      expect(control.valid).toBe(false)
    })
  })

})
