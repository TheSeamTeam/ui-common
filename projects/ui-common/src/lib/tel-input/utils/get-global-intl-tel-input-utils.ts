import { intlTelInputUtils } from '../intl-tel-input'

export function globalIntlTelInputUtils(): typeof intlTelInputUtils {
  return (window as any).intlTelInputUtils
}
