import { FormControl, FormGroup } from '@angular/forms'
import { of } from 'rxjs'

import { getAddress1Validators } from './get-address1-validators'
import { getAddress2Validators } from './get-address2-validators'
import { getCityValidators } from './get-city-validators'
import { getCountryValidators } from './get-country-validators'
import { getStateValidators } from './get-state-validators'
import { getZipValidators } from './get-zip-validators'

describe('getAddress1Validators', () => {
  it('should include required by default', () => {
    const v = getAddress1Validators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should exclude required when overrides.required is false', () => {
    const v = getAddress1Validators(undefined, { required: false })
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })

  it('should use custom maxLength from config', () => {
    const v = getAddress1Validators({ address1MaxLength: 5 })
    const ctrl = new FormControl('123456', v.validators)
    expect(ctrl.hasError('maxlength')).toBe(true)
  })

  it('should have no async validators', () => {
    const v = getAddress1Validators()
    expect(v.asyncValidators).toEqual([])
  })
})

describe('getAddress2Validators', () => {
  it('should not include required (address2 is optional)', () => {
    const v = getAddress2Validators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })

  it('should use custom maxLength from config', () => {
    const v = getAddress2Validators({ address2MaxLength: 3 })
    const ctrl = new FormControl('1234', v.validators)
    expect(ctrl.hasError('maxlength')).toBe(true)
  })
})

describe('getCityValidators', () => {
  it('should include required by default', () => {
    const v = getCityValidators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should exclude required when overrides.required is false', () => {
    const v = getCityValidators(undefined, { required: false })
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })
})

describe('getCountryValidators', () => {
  it('should include required by default', () => {
    const v = getCountryValidators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should add onlyAllowUsa validator when option set', () => {
    const v = getCountryValidators(undefined, { onlyAllowUsa: true })
    const ctrl = new FormControl('CAN', v.validators)
    expect(ctrl.hasError('onlyAllowUsa')).toBe(true)
  })

  it('should pass for USA when onlyAllowUsa is true', () => {
    const v = getCountryValidators(undefined, { onlyAllowUsa: true })
    const ctrl = new FormControl('USA', v.validators)
    expect(ctrl.hasError('onlyAllowUsa')).toBe(false)
  })
})

describe('getStateValidators', () => {
  const stateCodes$ = of(['AL', 'MS'])

  it('should include required by default (requiredOutsideUSA=true)', () => {
    const v = getStateValidators(stateCodes$)
    expect(v.validators.length).toBeGreaterThanOrEqual(1)
  })

  it('should have state-province-region async validator', () => {
    const v = getStateValidators(stateCodes$)
    expect(v.asyncValidators.length).toBe(1)
  })
})

describe('getZipValidators', () => {
  it('should have validators using ifUSA', () => {
    const v = getZipValidators()
    expect(v.validators.length).toBeGreaterThanOrEqual(2)
    expect(v.asyncValidators).toEqual([])
  })
})
