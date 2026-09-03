import { polygonViolatesMinMax } from './polygon-violates-min-max'

describe('polygonViolatesMinMax', () => {
  it('returns true when length is below min', () => {
    expect(polygonViolatesMinMax(2, 3)).toBe(true)
  })

  it('returns false when length equals min', () => {
    expect(polygonViolatesMinMax(3, 3)).toBe(false)
  })

  it('returns false when length is above min and no max', () => {
    expect(polygonViolatesMinMax(10, 3)).toBe(false)
  })

  it('returns true when length exceeds max (and max > min)', () => {
    expect(polygonViolatesMinMax(11, 3, 10)).toBe(true)
  })

  it('ignores max when max is not greater than min', () => {
    expect(polygonViolatesMinMax(100, 3, 3)).toBe(false)
  })

  it('returns false when length is within [min, max]', () => {
    expect(polygonViolatesMinMax(5, 3, 10)).toBe(false)
  })
})
