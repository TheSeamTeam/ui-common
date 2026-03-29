import { computeDirection } from './compute-direction'

describe('computeDirection', () => {
  it('returns "sibling" for same-depth siblings with shared parent', () => {
    expect(computeDirection(['claims'], ['purchase-orders'])).toBe('sibling')
  })

  it('returns "sibling" for cross-branch with different depths', () => {
    expect(
      computeDirection(['claims', '123', 'edit'], ['purchase-orders', '456']),
    ).toBe('sibling')
  })

  it('returns "sibling" for cross-branch with asymmetric depth', () => {
    expect(
      computeDirection(['claims', '123', 'edit'], ['purchase-orders']),
    ).toBe('sibling')
  })

  it('returns "sibling" for cross-branch going to deeper path', () => {
    expect(
      computeDirection(['purchase-orders'], ['claims', '123', 'edit']),
    ).toBe('sibling')
  })

  it('returns "sibling" when navigating between siblings with shared parent', () => {
    expect(computeDirection(['claims', '123'], ['claims', '456'])).toBe(
      'sibling',
    )
  })

  it('returns "deeper" when entering a child (prev remainder is empty)', () => {
    expect(computeDirection(['claims'], ['claims', '123'])).toBe('deeper')
  })

  it('returns "deeper" for multi-level depth increase', () => {
    expect(computeDirection(['claims'], ['claims', '123', 'edit'])).toBe(
      'deeper',
    )
  })

  it('returns "shallower" when returning to parent (next remainder is empty)', () => {
    expect(computeDirection(['claims', '123'], ['claims'])).toBe('shallower')
  })

  it('returns "deeper" when previous is empty (initial navigation)', () => {
    expect(computeDirection([], ['claims'])).toBe('deeper')
  })

  it('returns "sibling" when both are empty', () => {
    expect(computeDirection([], [])).toBe('sibling')
  })
})
