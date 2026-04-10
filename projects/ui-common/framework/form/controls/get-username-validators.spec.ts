import { FormControl } from '@angular/forms'
import { of } from 'rxjs'

import { getUsernameValidators } from './get-username-validators'

describe('getUsernameValidators', () => {
  const userExistsFn = (name: string) => of(false)

  it('should include required by default', () => {
    const v = getUsernameValidators(userExistsFn)
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should exclude required when overrides.required is false', () => {
    const v = getUsernameValidators(userExistsFn, undefined, {
      required: false,
    })
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })

  it('should enforce minLength from config', () => {
    const v = getUsernameValidators(userExistsFn, { minLength: 5 })
    const ctrl = new FormControl('abc', v.validators)
    expect(ctrl.hasError('minlength')).toBe(true)
  })

  it('should enforce pattern from config', () => {
    const v = getUsernameValidators(userExistsFn)
    const ctrl = new FormControl('user name!', v.validators)
    expect(ctrl.hasError('pattern')).toBe(true)
  })

  it('should have one async validator (usernameExists)', () => {
    const v = getUsernameValidators(userExistsFn)
    expect(v.asyncValidators.length).toBe(1)
  })
})
