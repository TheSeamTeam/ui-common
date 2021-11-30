import { default as expectPatched } from '@storybook/expect'
import { instrument } from '@storybook/instrumenter'
import * as mock from 'jest-mock'

export const { jest } = instrument({ jest: mock })

const expectJasmineFn = (window as any).expect
const expectJestFn = expectPatched
const isInJasmine = expectJasmineFn !== undefined && expectJasmineFn !== null
// const expectFn = expectJasmineFn || exp

// console.log('isInJasmine', isInJasmine)

const { expect } = instrument(
  { expect: expectJasmineFn || expectJestFn },
  // { intercept: (method, path) => path[0] !== 'expect' }
  { intercept: (method, path) => {
    // console.log('intercept', method, path)
    return path[0] !== 'expect'
  } }
)





function toBeFn(matcher: any): (value: any) => Promise<void> {
  if (isInJasmine) {
    // @ts-ignore
    const m = matcher as jasmine.Matchers<any>
    return async (value: any) => m.toBe(value) as any
  } else {
    const m = matcher as ReturnType<typeof expectJestFn>
    return async (value: any) => m.toBe(value) as any
  }
}

export function expectFn(value: any) {
  const t = isInJasmine ? expectJasmineFn(value) :  expect(value)
  return {
    toBe: toBeFn(t)
  }
}
