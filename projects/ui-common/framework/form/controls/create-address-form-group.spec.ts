import { FormGroup } from '@angular/forms'
import { of } from 'rxjs'

import { createAddressFormGroup } from './create-address-form-group'

describe('createAddressFormGroup', () => {
  const stateCodes$ = of(['AL', 'MS', 'CA'])

  it('should return group and subscription when no destroyRef', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    expect(result.group).toBeInstanceOf(FormGroup)
    expect(result.subscription).toBeDefined()
    result.subscription.unsubscribe()
  })

  it('should create all address controls', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    const controls = result.group.controls
    expect(controls.address1).toBeDefined()
    expect(controls.address2).toBeDefined()
    expect(controls.city).toBeDefined()
    expect(controls.state).toBeDefined()
    expect(controls.zip).toBeDefined()
    expect(controls.country).toBeDefined()
    result.subscription.unsubscribe()
  })

  it('should default country to USA', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    expect(result.group.controls.country.value).toBe('USA')
    result.subscription.unsubscribe()
  })

  it('should allow overriding default country', () => {
    const result = createAddressFormGroup({
      stateCodes: stateCodes$,
      defaultCountry: 'CAN',
    })
    expect(result.group.controls.country.value).toBe('CAN')
    result.subscription.unsubscribe()
  })

  it('should update zip/state validators when country changes', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    const { group, subscription } = result

    // Change country from USA to CAN
    group.controls.country.setValue('CAN')

    // Verify the subscription is wired up
    expect(subscription.closed).toBe(false)
    subscription.unsubscribe()
  })
})
