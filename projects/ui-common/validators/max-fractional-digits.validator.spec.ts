import { FormControl } from '@angular/forms'

import { maxFractionalDigitsValidator } from './max-fractional-digits.validator'

describe('maxFractionalDigitsValidator', () => {
  it('should return null for empty control', () => {
    expect(maxFractionalDigitsValidator(0)(new FormControl())).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(null))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(undefined))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl([]))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(''))).toBeNull()
  })

  it('should return null for non-number control values', () => {
    expect(maxFractionalDigitsValidator(0)(new FormControl('a'))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl({}))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(NaN))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(Infinity))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(new Date()))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(new Object()))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(true))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(false))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl([1]))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(['1']))).toBeNull()
  })

  it('should succeed for valid control values', () => {
    expect(maxFractionalDigitsValidator(0)(new FormControl(0))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl(123))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new FormControl(1.0))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new FormControl(-1.0))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl(.12))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl(-1.12))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl(0))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl(.1))).toBeNull()

    expect(maxFractionalDigitsValidator(0)(new FormControl('0'))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new FormControl('123'))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new FormControl('1.0'))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new FormControl('-1.0'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl('.12'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl('-1.12'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl('0'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new FormControl('.1'))).toBeNull()
  })

  it('should fail for non-valid control values', () => {
    expect(maxFractionalDigitsValidator(0)(new FormControl('.1'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 0 fractional digits.`,
        'max': 0,
        'actual': 1
      }
    })
    expect(maxFractionalDigitsValidator(0)(new FormControl('.12'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 0 fractional digits.`,
        'max': 0,
        'actual': 2
      }
    })
    expect(maxFractionalDigitsValidator(0)(new FormControl('0.1'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 0 fractional digits.`,
        'max': 0,
        'actual': 1
      }
    })
    expect(maxFractionalDigitsValidator(1)(new FormControl('.12'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 1 fractional digits.`,
        'max': 1,
        'actual': 2
      }
    })
  })
})
