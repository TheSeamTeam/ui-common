
export interface TelInputCountryData {
  dialCodes: { [dialCode: string]: boolean }
  countryCodes: { [dialCode: string]: string[] }
  countryCodeMaxLen: number
}
