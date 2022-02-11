import { FormControl } from '@angular/forms'

import { minFractionalDigitsValidator } from './min-fractional-digits.validator'

describe('minFractionalDigitsValidator', () => {
  it('should return null for empty control', () => {
    expect(minFractionalDigitsValidator(0)(new FormControl())).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(null))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(undefined))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl([]))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(''))).toBeNull()
  })

  it('should return null for non-number control values', () => {
    expect(minFractionalDigitsValidator(0)(new FormControl('a'))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl({}))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(NaN))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(Infinity))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(new Date()))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(new Object()))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(true))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(false))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl([1]))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(['1']))).toBeNull()
  })

  it('should succeed for valid control values', () => {
    expect(minFractionalDigitsValidator(0)(new FormControl(0))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl(123))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new FormControl(1.0))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new FormControl(-1.0))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl(.12))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl(-1.12))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl(0))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl(.123))).toBeNull()

    expect(minFractionalDigitsValidator(0)(new FormControl('0'))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new FormControl('123'))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new FormControl('1.0'))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new FormControl('-1.0'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl('.12'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl('-1.12'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl('0'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new FormControl('.123'))).toBeNull()
  })

  it('should fail for non-valid control values', () => {
    expect(minFractionalDigitsValidator(2)(new FormControl('.1'))).toEqual({
      'minFractionalDigits': {
        'reason': `Must not be less than 2 fractional digits.`,
        'min': 2,
        'actual': 1
      }
    })
    expect(minFractionalDigitsValidator(1)(new FormControl('0.'))).toEqual({
      'minFractionalDigits': {
        'reason': `Must not be less than 1 fractional digits.`,
        'min': 1,
        'actual': 0
      }
    })
  })
})
