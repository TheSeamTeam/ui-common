import type { TelInputCountryData } from '../models/index'

function getNumeric(s: string): string {
  return s.replace(/\D/g, '')
}

export function getCountryCode(data: TelInputCountryData, dialCode: string) {
  const _countryCodes = data.countryCodes[getNumeric(dialCode)]
  // Refer to `_setInitialState` to get libraries default logic
  return (_countryCodes === undefined || _countryCodes === null || _countryCodes.length === 0) ? 'us' : _countryCodes[0]
}
