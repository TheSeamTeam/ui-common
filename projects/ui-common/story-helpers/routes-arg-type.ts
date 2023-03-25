// import { ArgType } from '@storybook/addons'

declare const __STORYBOOK_ADDONS: any

function goToHashUrl(url: string): void { location.hash = `#${url}` }

// __STORYBOOK_ADDONS.getChannel().on('custom/go-to-hash', (data: { hash: string }) => {

//   goToHashUrl(data.hash)
// })

// __STORYBOOK_ADDONS.getChannel().on('storyArgsUpdated', (data: { hash: string }) => {
//   console.log('storyArgsUpdated')
// })

export function routesArgType(routes: string[])/*: ArgType*/ {
  return {
    options: routes,
    control: {
      type: 'select',
      // Runs in the 'manager', so I am emitting to a channel in the 'preview'.
      onChange: (e: any, a: any) => { __STORYBOOK_ADDONS.getChannel().emit('custom/go-to-hash', { hash: e }); return e }
    }
  }
}
