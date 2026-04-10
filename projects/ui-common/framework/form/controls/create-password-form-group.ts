import { FormControl, FormGroup, Validators } from '@angular/forms'

import { TheSeamPasswordFieldConfig } from '../models/password-field-config'
import { TheSeamPasswordFormValue } from '../models/password-form-value'
import { passwordMatchValidator } from '../validators/password-match.validator'
import { getPasswordValidators } from './get-password-validators'

export type TheSeamPasswordFormControls = Record<
  keyof TheSeamPasswordFormValue,
  FormControl<string | null>
>

export function createPasswordFormGroup(
  config?: Partial<TheSeamPasswordFieldConfig>,
): FormGroup<TheSeamPasswordFormControls> {
  const v = getPasswordValidators(config)

  return new FormGroup<TheSeamPasswordFormControls>(
    {
      password1: new FormControl<string | null>(
        null,
        v.validators,
        v.asyncValidators,
      ),
      password2: new FormControl<string | null>(null, Validators.required),
    },
    { validators: [passwordMatchValidator] },
  )
}
