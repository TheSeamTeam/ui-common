import { mixinDisabled } from './disabled'

describe('MixinDisabled', () => {
  it('should augment an existing class with a disabled property', () => {
    class EmptyClass { }

    const classWithDisabled = mixinDisabled(EmptyClass)
    // eslint-disable-next-line new-cap
    const instance = new classWithDisabled()

    expect(instance.disabled).toBe(false)

    instance.disabled = true
    expect(instance.disabled).toBe(true)
  })
})
