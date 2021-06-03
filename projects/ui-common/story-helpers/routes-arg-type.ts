import { ArgType } from '@storybook/addons'

function goToUrl(url: string): void {
  location.hash = `#${url}`
}

export function routesArgType(routes: string[]): ArgType {
  return {
    control: {
      type: 'select',
      options: routes
    }
  }
}
