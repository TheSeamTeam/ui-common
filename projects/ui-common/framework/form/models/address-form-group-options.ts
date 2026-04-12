import { DestroyRef } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription } from 'rxjs'

import { TheSeamAddressFieldConfig } from './address-field-config'
import { TheSeamAddressFormValue } from './address-form-value'

export interface TheSeamAddressFormGroupOptions {
  config?: Partial<TheSeamAddressFieldConfig>
  stateCodes: Observable<string[]>
  /** default: true */
  countryRequiredOutsideUSA?: boolean
  /** default: 'USA' */
  defaultCountry?: string
  /** If provided, country-change subscription is auto-cleaned up. */
  destroyRef?: DestroyRef
}

export type TheSeamAddressFormControls = Record<
  keyof TheSeamAddressFormValue,
  FormControl<string | null>
>

export type TheSeamAddressFormGroupResult<
  T extends TheSeamAddressFormGroupOptions,
> = T extends { destroyRef: DestroyRef }
  ? FormGroup<TheSeamAddressFormControls>
  : {
      group: FormGroup<TheSeamAddressFormControls>
      subscription: Subscription
    }
