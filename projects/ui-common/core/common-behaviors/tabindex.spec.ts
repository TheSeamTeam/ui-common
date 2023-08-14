import { mixinTabIndex } from './tabindex'

class TestClass {
  disabled = false
}

describe('mixinTabIndex', () => {
  it('should augment an existing class with a tabIndex property', () => {
    const classWithMixin = mixinTabIndex(TestClass)
    // eslint-disable-next-line new-cap
    const instance = new classWithMixin()

    expect(instance.tabIndex).toBe(0)

    instance.tabIndex = 4

    expect(instance.tabIndex).toBe(4)
  })

  it('should set tabIndex to `-1` if the disabled property is set to true', () => {
    const classWithMixin = mixinTabIndex(TestClass)
    // eslint-disable-next-line new-cap
    const instance = new classWithMixin()

    expect(instance.tabIndex).toBe(0)

    instance.disabled = true

    expect(instance.tabIndex).toBe(-1)
  })

  it('should allow having a custom default tabIndex value', () => {
    const classWithMixin = mixinTabIndex(TestClass, 20)
    // eslint-disable-next-line new-cap
    const instance = new classWithMixin()

    expect(instance.tabIndex).toBe(20)

    instance.tabIndex = 0

    expect(instance.tabIndex).toBe(0)
  })
})
