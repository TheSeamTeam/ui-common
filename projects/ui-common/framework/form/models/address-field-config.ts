export interface TheSeamAddressFieldConfig {
  address1MaxLength: number
  address2MaxLength: number
  cityMaxLength: number
  stateMaxLength: number
  countryMaxLength: number
  zipcodePattern: RegExp
}

export const DEFAULT_ADDRESS_FIELD_CONFIG: TheSeamAddressFieldConfig = {
  address1MaxLength: 50,
  address2MaxLength: 50,
  cityMaxLength: 50,
  stateMaxLength: 200,
  countryMaxLength: 10,
  zipcodePattern: /^\d{5}(?:[-\s]\d{4})?$/,
}
