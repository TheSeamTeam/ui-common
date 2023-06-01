import { UntypedFormControl } from '@angular/forms'

import { maxFractionalDigitsValidator } from './max-fractional-digits.validator'

describe('maxFractionalDigitsValidator', () => {
  it('should return null for empty control', () => {
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl())).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(null))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(undefined))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl([]))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(''))).toBeNull()
  })

  it('should return null for non-number control values', () => {
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl('a'))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl({}))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(NaN))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(Infinity))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(new Date()))).toBeNull()
    // eslint-disable-next-line no-new-object
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(new Object()))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(true))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(false))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl([1]))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(['1']))).toBeNull()
  })

  it('should succeed for valid control values', () => {
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(0))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl(123))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new UntypedFormControl(1.0))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new UntypedFormControl(-1.0))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl(0.12))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl(-1.12))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl(0))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl(0.1))).toBeNull()

    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl('0'))).toBeNull()
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl('123'))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new UntypedFormControl('1.0'))).toBeNull()
    expect(maxFractionalDigitsValidator(1)(new UntypedFormControl('-1.0'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl('.12'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl('-1.12'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl('0'))).toBeNull()
    expect(maxFractionalDigitsValidator(2)(new UntypedFormControl('.1'))).toBeNull()
  })

  it('should fail for non-valid control values', () => {
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl('.1'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 0 fractional digits.`,
        'max': 0,
        'actual': 1
      }
    })
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl('.12'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 0 fractional digits.`,
        'max': 0,
        'actual': 2
      }
    })
    expect(maxFractionalDigitsValidator(0)(new UntypedFormControl('0.1'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 0 fractional digits.`,
        'max': 0,
        'actual': 1
      }
    })
    expect(maxFractionalDigitsValidator(1)(new UntypedFormControl('.12'))).toEqual({
      'maxFractionalDigits': {
        'reason': `Must not be greater than 1 fractional digits.`,
        'max': 1,
        'actual': 2
      }
    })
  })
})
