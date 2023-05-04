import { UntypedFormControl } from '@angular/forms'

import { minFractionalDigitsValidator } from './min-fractional-digits.validator'

describe('minFractionalDigitsValidator', () => {
  it('should return null for empty control', () => {
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl())).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(null))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(undefined))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl([]))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(''))).toBeNull()
  })

  it('should return null for non-number control values', () => {
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl('a'))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl({}))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(NaN))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(Infinity))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(new Date()))).toBeNull()
    // eslint-disable-next-line no-new-object
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(new Object()))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(true))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(false))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl([1]))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(['1']))).toBeNull()
  })

  it('should succeed for valid control values', () => {
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(0))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl(123))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new UntypedFormControl(1.0))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new UntypedFormControl(-1.0))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl(0.12))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl(-1.12))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl(0))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl(0.123))).toBeNull()

    expect(minFractionalDigitsValidator(0)(new UntypedFormControl('0'))).toBeNull()
    expect(minFractionalDigitsValidator(0)(new UntypedFormControl('123'))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new UntypedFormControl('1.0'))).toBeNull()
    expect(minFractionalDigitsValidator(1)(new UntypedFormControl('-1.0'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl('.12'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl('-1.12'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl('0'))).toBeNull()
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl('.123'))).toBeNull()
  })

  it('should fail for non-valid control values', () => {
    expect(minFractionalDigitsValidator(2)(new UntypedFormControl('.1'))).toEqual({
      'minFractionalDigits': {
        'reason': `Must not be less than 2 fractional digits.`,
        'min': 2,
        'actual': 1
      }
    })
    expect(minFractionalDigitsValidator(1)(new UntypedFormControl('0.'))).toEqual({
      'minFractionalDigits': {
        'reason': `Must not be less than 1 fractional digits.`,
        'min': 1,
        'actual': 0
      }
    })
  })
})
