import { color, typography } from '@storybook/theming'
import { themes } from '@storybook/theming'

export const seamThemeDark = {
  ...themes.dark,

  // base: 'dark',

  // // Storybook-specific color palette
  // colorPrimary: '#FF5555',
  // colorSecondary: '#1EA7FD',

  // // UI
  // appBg: '#2f2f2f',
  // appContentBg: '#333',
  // appBorderColor: 'rgba(255,255,255,.1)',
  // appBorderRadius: 4,

  // // Fonts
  // fontBase: typography.fonts.base,
  // fontCode: typography.fonts.mono,

  // // Text colors
  // textColor: color.lightest,
  // textInverseColor: color.darkest,

  // // Toolbar default and active colors
  // barTextColor: '#999999',
  // barSelectedColor: color.secondary,
  // // barBg: color.darkest,
  // barBg: color.darkest,

  // // Form colors
  // inputBg: '#3f3f3f',
  // inputBorder: 'rgba(0,0,0,.3)',
  // inputTextColor: color.lightest,
  // inputBorderRadius: 4,

  // Brand
  brandTitle: 'The Seam',
  brandUrl: 'https://github.com/TheSeamTeam/ui-common',
  brandImage: 'assets/images/theseam_storybook_logo.svg'
}

export const seamThemeNormal = {
  ...themes.normal,

  // Brand
  brandTitle: 'The Seam',
  brandUrl: 'https://github.com/TheSeamTeam/ui-common',
  brandImage: 'assets/images/theseam_logo.svg'
}

export const seamThemeLight = {
  ...themes.light,

  // Brand
  brandTitle: 'The Seam',
  brandUrl: 'https://github.com/TheSeamTeam/ui-common',
  brandImage: 'assets/images/theseam_logo.svg'
}
