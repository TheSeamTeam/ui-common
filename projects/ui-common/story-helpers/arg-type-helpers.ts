// import { ArgType } from '@storybook/addons'

declare type ArgType = any

import { OutlineThemeNames, ThemeNames } from '@theseam/ui-common/models'

export const themeArgType: ArgType = {
  defaultValue: 'primary',
  control: {
    type: 'select',
    options: ThemeNames
  },
  description: `Theme style.`
}

export const themeWithOutlineArgType: ArgType = {
  defaultValue: 'primary',
  control: {
    type: 'select',
    options: [ ...ThemeNames, ...OutlineThemeNames ]
  },
  description: `Theme style.`
}

export const sizeArgType: ArgType = {
  defaultValue: undefined,
  control: {
    type: 'select',
    options: [ undefined, 'sm', 'lg' ]
  },
  description: `Size.`
}

export const buttonTypeArgType: ArgType = {
  defaultValue: 'button',
  control: {
    type: 'select',
    options: [ 'button', 'submit' ]
  },
  description: `Button type.`
}
