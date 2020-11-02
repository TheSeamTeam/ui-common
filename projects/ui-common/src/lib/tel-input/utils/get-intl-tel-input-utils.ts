import { notNullOrUndefined, waitOnConditionAsync } from '../../utils/index'

import type { IntlTelInputUtilsScript } from '../intl-tel-input'
import { TEL_INPUT_UTILS_PATH } from '../tel-input-constants'
import { globalIntlTelInputGlobals } from './get-global-intl-tel-input-globals'
import { globalIntlTelInputUtils } from './get-global-intl-tel-input-utils'

export function getIntlTelInputUtils(): Promise<IntlTelInputUtilsScript> {
  if (globalIntlTelInputUtils()) {
    return Promise.resolve(globalIntlTelInputUtils())
  }

  if ((globalIntlTelInputGlobals() as any).startedLoadingUtilsScript) {
    return waitOnConditionAsync(() => notNullOrUndefined(globalIntlTelInputUtils()), 5000)
      .then(() => globalIntlTelInputUtils())
  }

  return globalIntlTelInputGlobals().loadUtils(TEL_INPUT_UTILS_PATH)
    .then(() => waitOnConditionAsync(() => notNullOrUndefined(globalIntlTelInputUtils()), 5000))
    .then(() => globalIntlTelInputUtils())
}
