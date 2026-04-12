import { FormControl, FormGroup } from '@angular/forms'
import { of } from 'rxjs'

import { stateProvinceRegionValidator } from './state-province-region.validator'

describe('stateProvinceRegionValidator', () => {
  const stateCodes$ = of(['AL', 'AK', 'AZ', 'AR', 'CA', 'MS'])
  const validator = stateProvinceRegionValidator(stateCodes$)

  function createGroup(country: string, state: string) {
    return new FormGroup({
      country: new FormControl(country),
      state: new FormControl(state),
    })
  }

  it('should return null for empty value', async () => {
    const group = createGroup('USA', '')
    const result = await validator(group.controls.state)
    expect(result).toBeNull()
  })

  it('should return null when no country sibling exists', async () => {
    const control = new FormControl('XX')
    const result = await validator(control)
    expect(result).toBeNull()
  })

  it('should return null for non-USA country', async () => {
    const group = createGroup('CAN', 'XX')
    const result = await validator(group.controls.state)
    expect(result).toBeNull()
  })

  it('should return null for valid USA state code', async () => {
    const group = createGroup('USA', 'MS')
    const result = await validator(group.controls.state)
    expect(result).toBeNull()
  })

  it('should return error for invalid USA state code', async () => {
    const group = createGroup('USA', 'XX')
    const result = await validator(group.controls.state)
    expect(result).toEqual({
      stateProvinceRegion: {
        reason: `If value of 'country' is 'USA' then a valid state must be selected.`,
      },
    })
  })
})
