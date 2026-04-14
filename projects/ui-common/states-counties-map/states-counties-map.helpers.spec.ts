import {
  isCountySelected,
  stateIdFromCountyId,
} from './states-counties-map.helpers'

describe('stateIdFromCountyId', () => {
  it('returns the first two digits of a 5-digit county id (string)', () => {
    expect(stateIdFromCountyId('01001')).toBe('01')
    expect(stateIdFromCountyId('48201')).toBe('48')
  })

  it('returns the first digit(s) of a numeric county id (topojson feature ids are often numbers)', () => {
    expect(stateIdFromCountyId(1001)).toBe('1')
    expect(stateIdFromCountyId(48201)).toBe('48')
  })
})

describe('isCountySelected', () => {
  it('returns true when the county id is in the selection (both strings)', () => {
    expect(isCountySelected('01001', ['01001', '01003'])).toBe(true)
  })

  it('returns true across numeric and string representations', () => {
    expect(isCountySelected(1001, ['01001'])).toBe(true)
    expect(isCountySelected('01001', ['1001'])).toBe(true)
  })

  it('returns false when not selected', () => {
    expect(isCountySelected('01001', ['48201'])).toBe(false)
  })

  it('returns false for an empty or nullish selection', () => {
    expect(isCountySelected('01001', [])).toBe(false)
    expect(isCountySelected('01001', null)).toBe(false)
    expect(isCountySelected('01001', undefined)).toBe(false)
  })
})
