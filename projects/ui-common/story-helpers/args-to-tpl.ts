/* eslint-disable no-prototype-builtins */
import { action, HandlerFunction } from '@storybook/addon-actions'
import { AngularRenderer, ArgTypes } from '@storybook/angular'
import { useStoryContext } from '@storybook/preview-api'

export interface ArgsTplParts {
  actions: { [prop: string]: HandlerFunction }
  tplfragment: string
}

/**
 * This is an attempt at simplifying the use of auto-generated args in stories
 * defined with `template`, since Angular doesn't have a way to simply use a
 * spread operator syntax.
 *
 * @experimental
 */
// export function argsToTplParts(args: any, argTypes: ArgTypes): ArgsTplParts {
//   // console.log({ args, argTypes })
//   const parts: ArgsTplParts = {
//     actions: {},
//     tplfragment: ''
//   }

//   Object.keys(argTypes).forEach(k => {
//     // Inputs
//     if (
//       // Is in the inputs category
//       argTypes[k].table.category === 'inputs' &&
//       // Needs a control to be able to change from auto-generated args.
//       argTypes[k]?.hasOwnProperty('control') &&
//       // Assuming the arg might not be in props if there isn't an arg value.
//       args.hasOwnProperty(k)
//     ) {
//       parts.tplfragment += `[${k}]="${k}" `
//     }

//     // Outputs
//     if (
//       // Is in the outputs category
//       argTypes[k]?.table?.category === 'outputs'
//     ) {
//       // Without access to props, I don't know if I can get an action into the
//       // template context like this.
//       parts.tplfragment += `(${k})="${k}($event)" `
//       parts.actions[k] = action(k)
//     }
//   })

//   return parts
// }

function removeDuplicates(arr: string[]) {
  const seen: { [k: string]: boolean } = {}
  return arr.filter(item => {
    if (!seen[item]) {
      seen[item] = true
      return true
    }
    return false
  })
}

export interface ArgsTplOptions {
  /**
   * Properties to always bind to the template.
   */
  alwaysBind?: string[]
  /**
   * Properties to exclude from bidning to the template.
   */
  exclude?: string[]
}

/**
 * This is an attempt at simplifying the use of auto-generated args in stories
 * defined with `template`, since Angular doesn't have a way to simply use a
 * spread operator syntax.
 *
 * @experimental
 */
export function argsToTpl(options?: ArgsTplOptions) {
  const context = useStoryContext<AngularRenderer>()

  const exclude = [
    ...(context?.parameters?.argsToTplOptions?.exclude || []),
    ...(options?.exclude || []),
  ]

  const alwaysBind = context?.parameters?.argsToTplOptions?.alwaysBind || []

  const props = removeDuplicates([
    ...alwaysBind,
    ...Object.keys(context.args),
  ])

  const parts = props
    .filter(k => exclude.indexOf(k) === -1)
    .map(k => {
      // Outputs
      if (
        context.argTypes[k]?.hasOwnProperty('action') &&
        (context.args.hasOwnProperty(k) || alwaysBind.indexOf(k) !== -1)
      ) {
        return `(${k})="${k}($event)"`
      }

      // Inputs
      if (
        (context.args.hasOwnProperty(k) || alwaysBind.indexOf(k) !== -1)
      ) {
        return `[${k}]="${k}"`
      }
    })

  return parts.length > 0 ? parts.join(' ') : ''
}
