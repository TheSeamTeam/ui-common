import { FormControl } from '@angular/forms'

import { getPasswordValidators } from './get-password-validators'

describe('getPasswordValidators', () => {
  it('should include required by default', () => {
    const v = getPasswordValidators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should exclude required when overrides.required is false', () => {
    const v = getPasswordValidators(undefined, { required: false })
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })

  it('should include all password validators', () => {
    const v = getPasswordValidators()
    // required + content + length + uppercase + lowercase + number + specialChar = 7
    expect(v.validators.length).toBe(7)
  })

  it('should have no async validators', () => {
    const v = getPasswordValidators()
    expect(v.asyncValidators).toEqual([])
  })

  it('should pass for a strong password', () => {
    const v = getPasswordValidators()
    const ctrl = new FormControl('MyStr0ng!', v.validators)
    expect(ctrl.valid).toBe(true)
  })

  it('should fail for password missing uppercase', () => {
    const v = getPasswordValidators()
    const ctrl = new FormControl('mystr0ng!', v.validators)
    expect(ctrl.hasError('passwordUppercase')).toBe(true)
  })

  it('should respect custom minLength config', () => {
    const v = getPasswordValidators({ minLength: 12 })
    const ctrl = new FormControl('MyStr0ng!', v.validators)
    expect(ctrl.hasError('passwordLength')).toBe(true)
  })
})
