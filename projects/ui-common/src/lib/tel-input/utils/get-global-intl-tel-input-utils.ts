import type { IntlTelInputUtilsScript } from '../intl-tel-input'

export function globalIntlTelInputUtils(): IntlTelInputUtilsScript {
  return (window as any).intlTelInputUtils
}
