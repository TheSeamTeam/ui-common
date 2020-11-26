import { BooleanInput } from './boolean-input.decorator'

class Fixture {
  @BooleanInput() b
}

function shouldCoerce(value: any, expected: boolean) {
  const f = new Fixture()
  f.b = value
  expect(typeof f.b).toBe('boolean')
  expect(f.b).toBe(expected)
}

fdescribe('Decorator BooleanInput', () => {
  it('should coerce boolean to boolean', () => {
    shouldCoerce(true, true)
  })

  it('should coerce \'true\' to true', () => {
    shouldCoerce('true', true)
  })

  it('should coerce \'false\' to false', () => {
    shouldCoerce('false', false)
  })

  it('should coerce undefined to false', () => {
    shouldCoerce(undefined, false)
  })

  it('should coerce null to false', () => {
    shouldCoerce(null, false)
  })

  it('should coerce {} to true', () => {
    shouldCoerce({}, true)
  })
})
