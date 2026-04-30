import { InjectionToken } from '@angular/core'

import { SignatureInputContainer } from './signature-input-panel.models'

export const THESEAM_SIGNATURE_INPUT_CONTAINER =
  new InjectionToken<SignatureInputContainer>(
    'THESEAM_SIGNATURE_INPUT_CONTAINER',
  )
