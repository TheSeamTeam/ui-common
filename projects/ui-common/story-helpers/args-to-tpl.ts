// import { action, HandlerFunction } from '@storybook/addon-actions'
// import { ArgTypes } from '@storybook/angular'

// export interface ArgsTplParts {
//   actions: { [prop: string]: HandlerFunction }
//   tplfragment: string
// }

// /**
//  * This is an attempt at simplifying the use of auto-generated args in stories
//  * defined with `template`, since Angular doesn't have a way to simply use a
//  * spread operator syntax.
//  *
//  * @experimental
//  */
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

// /**
//  * This is an attempt at simplifying the use of auto-generated args in stories
//  * defined with `template`, since Angular doesn't have a way to simply use a
//  * spread operator syntax.
//  *
//  * @experimental
//  */
// export function argsToTpl(args: any, argTypes: ArgTypes) {
//   // console.log({ args, argTypes })
//   let s = ''

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
//       s += `[${k}]="${k}" `
//     }

//     // Outputs
//     if (
//       // Is in the outputs category
//       argTypes[k]?.table?.category === 'outputs'
//     ) {
//       // Without access to props, I don't know if I can get an action into the
//       // template context like this.
//       // if (argTypes[k].table.category === 'inputs') {
//       //   s += `(${k})="${k}" `
//       // }
//     }
//   })

//   return s
// }
