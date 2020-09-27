import { ArgTypes } from '@storybook/addons'

import { hasProperty } from '../utils'

/**
 * This is an attempt at simplifying the use of auto-generated args in stories
 * defined with `template`, since Angular doesn't have a way to simply use a
 * spread operator syntax.
 *
 * @experimental
 */
export function argsToTpl(args: any, argTypes: ArgTypes) {
  // console.log({ args, argTypes })
  let s = ''

  Object.keys(argTypes).forEach(k => {
    if (hasProperty(argTypes[k], 'control') && hasProperty(args, k)) {
      // console.log('~', argTypes[k], args[k], k)
      if (argTypes[k].table.category === 'inputs') {
        s += `[${k}]="${k}" `
      }
    }
  })

  return s
}
