import { FormGroup } from '@angular/forms'

import { createPasswordFormGroup } from './create-password-form-group'

describe('createPasswordFormGroup', () => {
  it('should return a FormGroup', () => {
    const group = createPasswordFormGroup()
    expect(group).toBeInstanceOf(FormGroup)
  })

  it('should have password1 and password2 controls', () => {
    const group = createPasswordFormGroup()
    expect(group.controls.password1).toBeDefined()
    expect(group.controls.password2).toBeDefined()
  })

  it('should have passwordMatch group validator', () => {
    const group = createPasswordFormGroup()
    group.controls.password1.setValue('MyStr0ng!')
    group.controls.password2.setValue('Different!')
    expect(group.hasError('passwordMatch')).toBe(true)
  })

  it('should pass when passwords match and are strong', () => {
    const group = createPasswordFormGroup()
    group.controls.password1.setValue('MyStr0ng!')
    group.controls.password2.setValue('MyStr0ng!')
    expect(group.valid).toBe(true)
  })

  it('should fail when password1 is weak', () => {
    const group = createPasswordFormGroup()
    group.controls.password1.setValue('weak')
    group.controls.password2.setValue('weak')
    expect(group.controls.password1.valid).toBe(false)
  })

  it('should require password2', () => {
    const group = createPasswordFormGroup()
    expect(group.controls.password2.hasError('required')).toBe(true)
  })

  it('should accept custom minLength config', () => {
    const group = createPasswordFormGroup({ minLength: 12 })
    group.controls.password1.setValue('MyStr0ng!')
    group.controls.password2.setValue('MyStr0ng!')
    expect(group.controls.password1.hasError('passwordLength')).toBe(true)
  })
})
