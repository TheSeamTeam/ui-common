import { FormControl } from '@angular/forms'
import { of } from 'rxjs'

import { createAddress1Control } from './create-address1-control'
import { createAddress2Control } from './create-address2-control'
import { createCityControl } from './create-city-control'
import { createCountryControl } from './create-country-control'
import { createStateControl } from './create-state-control'
import { createUsernameControl } from './create-username-control'
import { createZipControl } from './create-zip-control'

describe('createAddress1Control', () => {
  it('should return a typed FormControl', () => {
    const ctrl = createAddress1Control()
    expect(ctrl).toBeInstanceOf(FormControl)
    expect(ctrl.value).toBeNull()
  })

  it('should accept initial form state', () => {
    const ctrl = createAddress1Control('123 Main St')
    expect(ctrl.value).toBe('123 Main St')
  })

  it('should be invalid when empty (required)', () => {
    const ctrl = createAddress1Control()
    expect(ctrl.valid).toBe(false)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should respect overrides to exclude required', () => {
    const ctrl = createAddress1Control(null, undefined, { required: false })
    expect(ctrl.hasError('required')).toBe(false)
  })
})

describe('createAddress2Control', () => {
  it('should be valid when empty (not required)', () => {
    const ctrl = createAddress2Control()
    expect(ctrl.valid).toBe(true)
  })
})

describe('createCityControl', () => {
  it('should be invalid when empty (required)', () => {
    const ctrl = createCityControl()
    expect(ctrl.hasError('required')).toBe(true)
  })
})

describe('createCountryControl', () => {
  it('should default to null when no formState', () => {
    const ctrl = createCountryControl()
    expect(ctrl.value).toBeNull()
  })

  it('should reject non-USA when onlyAllowUsa is true', () => {
    const ctrl = createCountryControl('CAN', { onlyAllowUsa: true })
    expect(ctrl.hasError('onlyAllowUsa')).toBe(true)
  })

  it('should accept USA when onlyAllowUsa is true', () => {
    const ctrl = createCountryControl('USA', { onlyAllowUsa: true })
    expect(ctrl.hasError('onlyAllowUsa')).toBe(false)
  })
})

describe('createStateControl', () => {
  it('should return a FormControl with async validators', () => {
    const ctrl = createStateControl(null, of(['AL', 'MS']))
    expect(ctrl).toBeInstanceOf(FormControl)
  })
})

describe('createZipControl', () => {
  it('should return a FormControl', () => {
    const ctrl = createZipControl()
    expect(ctrl).toBeInstanceOf(FormControl)
    expect(ctrl.value).toBeNull()
  })
})

describe('createUsernameControl', () => {
  it('should return a FormControl with async validators', () => {
    const ctrl = createUsernameControl(null, () => of(false))
    expect(ctrl).toBeInstanceOf(FormControl)
  })

  it('should be invalid when empty (required)', () => {
    const ctrl = createUsernameControl('', () => of(false))
    expect(ctrl.hasError('required')).toBe(true)
  })
})
