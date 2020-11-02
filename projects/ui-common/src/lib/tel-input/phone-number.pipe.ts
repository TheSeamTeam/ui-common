import { ChangeDetectorRef, NgZone, Pipe, PipeTransform } from '@angular/core'

import { intlTelInputUtils } from './intl-tel-input'
import { getCountryCode, getDialCode, getIntlTelInputUtils, globalIntlTelInputGlobals, processCountryCodes, TheSeamNumberFormatsInput } from './utils'
import { coercePhoneNumberFormat } from './utils'

@Pipe({
  name: 'phoneNumber',
  pure: false
})
export class TheSeamPhoneNumberPipe implements PipeTransform {

  private _latestPhoneNumber: string
  private _latestNumberFormat: TheSeamNumberFormatsInput
  private _latestValue: string

  constructor(private _cdr: ChangeDetectorRef) { }

  transform(
    phoneNumber: string,
    numberFormat: TheSeamNumberFormatsInput = intlTelInputUtils.numberFormat.INTERNATIONAL
  ): any {
    // console.log('transform', phoneNumber, numberFormat)
    if (this._latestPhoneNumber !== phoneNumber || this._latestNumberFormat !== numberFormat) {
      this._transform(phoneNumber, numberFormat)
    }
    this._latestPhoneNumber = phoneNumber
    this._latestNumberFormat = numberFormat

    // console.log('return', this._latestValue)
    return this._latestValue
  }

  async _transform(phoneNumber: string, numberFormat: TheSeamNumberFormatsInput) {
    // console.log('_transform', phoneNumber, numberFormat)
    const utils = await getIntlTelInputUtils()
    // console.log('utils', utils)

    const _format = coercePhoneNumberFormat(numberFormat)

    const data = processCountryCodes(globalIntlTelInputGlobals().getCountryData())
    const dialCode = getDialCode(data, phoneNumber)
    const countryCode = getCountryCode(data, dialCode)

    const number = phoneNumber
    // if (number.charAt(0) !== '+') {
    //   if (number.charAt(0) !== '1') { number = `1${number}` }
    //   number = `+${number}`
    // }

    const n = utils.formatNumber(number, countryCode, _format)
    // console.log('n', n)
    this._latestValue = n
    // this._cdr.markForCheck()
    this._cdr.detectChanges()
  }

}
