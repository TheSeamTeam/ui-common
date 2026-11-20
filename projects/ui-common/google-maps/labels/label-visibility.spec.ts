import { isLabelVisibleAtSize } from './label-visibility'

describe('isLabelVisibleAtSize', () => {
  it('hides a shape too small to read a label over', () => {
    expect(isLabelVisibleAtSize(10, 10)).toBe(false)
  })

  it('shows a comfortably sized shape', () => {
    expect(isLabelVisibleAtSize(200, 150)).toBe(true)
  })

  it('shows a long thin shape, which has room even though it is narrow', () => {
    // A field 200px long and 5px tall has plenty of room for a label. A rule
    // based on width AND height would wrongly hide it; the diagonal does not.
    expect(isLabelVisibleAtSize(200, 5)).toBe(true)
  })

  it('honours a custom threshold', () => {
    expect(isLabelVisibleAtSize(60, 60, 200)).toBe(false)
  })
})
