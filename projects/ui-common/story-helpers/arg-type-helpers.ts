// import { ArgType } from '@storybook/addons'

import { OutlineThemeNames, ThemeNames } from '@theseam/ui-common/models'

declare type ArgType = any

export const themeArgType: ArgType = {
  options: ThemeNames,
  control: {
    type: 'select',
  },
  description: `Theme style.`
}

export const themeWithOutlineArgType: ArgType = {
  options: [ ...ThemeNames, ...OutlineThemeNames ],
  control: {
    type: 'select',
  },
  description: `Theme style.`
}

export const sizeArgType: ArgType = {
  options: [ undefined, 'sm', 'lg' ],
  control: {
    type: 'select',
  },
  description: `Size.`
}

export const buttonTypeArgType: ArgType = {
  options: [ 'button', 'submit' ],
  control: {
    type: 'select',
  },
  description: `Button type.`
}
