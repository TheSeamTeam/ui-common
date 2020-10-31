import { IntlTelInput } from '../intl-tel-input'

export function globalIntlTelInputGlobals(): IntlTelInput.Static {
  return (window as any).intlTelInputGlobals
}
