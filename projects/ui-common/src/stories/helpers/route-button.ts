import { button } from '@storybook/addon-knobs'

export function routeButton(url: string) {
  return button(url, () => {
    location.hash = `#${url}`
    return false
  })
}
