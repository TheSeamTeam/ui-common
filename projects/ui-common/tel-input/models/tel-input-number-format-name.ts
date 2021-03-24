import { intlTelInputUtils } from '../intl-tel-input'

export const TelInputNumberFormatName: { [name: string]: intlTelInputUtils.numberFormat } = {
  'E164': intlTelInputUtils.numberFormat.E164,
  'INTERNATIONAL': intlTelInputUtils.numberFormat.INTERNATIONAL,
  'NATIONAL': intlTelInputUtils.numberFormat.NATIONAL,
  'RFC3966': intlTelInputUtils.numberFormat.RFC3966
}
