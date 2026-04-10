import { FormControl } from '@angular/forms'
import { of } from 'rxjs'

import { usernameExistsValidator } from './username-exists.validator'

describe('usernameExistsValidator', () => {
  it('should return null when user does not exist (Observable)', async () => {
    const validator = usernameExistsValidator(() => of(false))
    const control = new FormControl('newuser')
    const result = await validator(control)
    expect(result).toBeNull()
  })

  it('should return error when user exists (Observable)', async () => {
    const validator = usernameExistsValidator(() => of(true))
    const control = new FormControl('existinguser')
    const result = await validator(control)
    expect(result).toEqual({ usernameExists: {} })
  })

  it('should return null when user does not exist (Promise)', async () => {
    const validator = usernameExistsValidator(() => Promise.resolve(false))
    const control = new FormControl('newuser')
    const result = await validator(control)
    expect(result).toBeNull()
  })

  it('should return error when user exists (Promise)', async () => {
    const validator = usernameExistsValidator(() => Promise.resolve(true))
    const control = new FormControl('existinguser')
    const result = await validator(control)
    expect(result).toEqual({ usernameExists: {} })
  })

  it('should return null when user does not exist (boolean)', async () => {
    const validator = usernameExistsValidator(() => false)
    const control = new FormControl('newuser')
    const result = await validator(control)
    expect(result).toBeNull()
  })

  it('should return error when user exists (boolean)', async () => {
    const validator = usernameExistsValidator(() => true)
    const control = new FormControl('existinguser')
    const result = await validator(control)
    expect(result).toEqual({ usernameExists: {} })
  })
})
