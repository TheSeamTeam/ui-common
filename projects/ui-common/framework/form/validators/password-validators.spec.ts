import { FormControl, FormGroup } from '@angular/forms'

import { passwordContentValidator } from './password-content.validator'
import { passwordLowercaseValidator } from './password-lowercase.validator'
import { passwordUppercaseValidator } from './password-uppercase.validator'
import { passwordNumberValidator } from './password-number.validator'
import { passwordSpecialCharValidator } from './password-special-char.validator'
import { passwordLengthValidator } from './password-length.validator'
import { passwordMatchValidator } from './password-match.validator'

describe('passwordContentValidator', () => {
  it('should return null for valid password', () => {
    expect(passwordContentValidator(new FormControl('MyStr0ng!'))).toBeNull()
  })

  it('should return error when password contains "password"', () => {
    expect(passwordContentValidator(new FormControl('password123'))).toEqual({
      passwordContent: { value: 'password' },
    })
  })

  it('should be case-insensitive', () => {
    expect(passwordContentValidator(new FormControl('Password123'))).toEqual({
      passwordContent: { value: 'password' },
    })
  })
})

describe('passwordLowercaseValidator', () => {
  it('should return null when lowercase present', () => {
    expect(passwordLowercaseValidator(new FormControl('Hello'))).toBeNull()
  })

  it('should return error when no lowercase', () => {
    expect(passwordLowercaseValidator(new FormControl('HELLO'))).toEqual({
      passwordLowercase: {},
    })
  })
})

describe('passwordUppercaseValidator', () => {
  it('should return null when uppercase present', () => {
    expect(passwordUppercaseValidator(new FormControl('Hello'))).toBeNull()
  })

  it('should return error when no uppercase', () => {
    expect(passwordUppercaseValidator(new FormControl('hello'))).toEqual({
      passwordUppercase: {},
    })
  })
})

describe('passwordNumberValidator', () => {
  it('should return null when digit present', () => {
    expect(passwordNumberValidator(new FormControl('abc1'))).toBeNull()
  })

  it('should return error when no digit', () => {
    expect(passwordNumberValidator(new FormControl('abcdef'))).toEqual({
      passwordNumber: {},
    })
  })
})

describe('passwordSpecialCharValidator', () => {
  it('should return null when special char present', () => {
    expect(passwordSpecialCharValidator(new FormControl('abc!'))).toBeNull()
  })

  it('should return error when no special char', () => {
    expect(passwordSpecialCharValidator(new FormControl('abcdef1'))).toEqual({
      passwordSpecialChar: {},
    })
  })
})

describe('passwordLengthValidator', () => {
  it('should return null when length >= 8 (default)', () => {
    expect(passwordLengthValidator()(new FormControl('12345678'))).toBeNull()
  })

  it('should return error when length < 8 (default)', () => {
    expect(passwordLengthValidator()(new FormControl('1234567'))).toEqual({
      passwordLength: {},
    })
  })

  it('should accept custom minLength', () => {
    expect(
      passwordLengthValidator({ minLength: 4 })(new FormControl('abcd')),
    ).toBeNull()
    expect(
      passwordLengthValidator({ minLength: 4 })(new FormControl('abc')),
    ).toEqual({ passwordLength: {} })
  })
})

describe('passwordMatchValidator', () => {
  it('should return null when passwords match', () => {
    const group = new FormGroup({
      password1: new FormControl('MyStr0ng!'),
      password2: new FormControl('MyStr0ng!'),
    })
    expect(passwordMatchValidator(group)).toBeNull()
  })

  it('should return error when passwords do not match', () => {
    const group = new FormGroup({
      password1: new FormControl('MyStr0ng!'),
      password2: new FormControl('Different!'),
    })
    expect(passwordMatchValidator(group)).toEqual({
      passwordMatch: true,
    })
  })

  it('should return null when both empty', () => {
    const group = new FormGroup({
      password1: new FormControl(''),
      password2: new FormControl(''),
    })
    expect(passwordMatchValidator(group)).toBeNull()
  })
})
