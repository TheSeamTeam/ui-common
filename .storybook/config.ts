import { withA11y } from '@storybook/addon-a11y'
import { setCompodocJson } from '@storybook/addon-docs/angular'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { addDecorator, addParameters, configure } from '@storybook/angular'

import { seamThemeDark, seamThemeLight } from './theme'

// @ts-ignore
// eslint-disable-next-line import/extensions, import/no-unresolved
import docJson from '../documentation.json'

setCompodocJson(docJson)

addDecorator(withA11y)

// Option defaults.
addParameters({
  options: {
    // NOTE: Until I figure out the correct theme settings, my prefered theme is
    // to open the storybook with `seamThemeDark`, then comment out the theme
    // option. That way it seems to partially remember the dark theme colors in
    // localstorage, or possibly cache, of the outer shell, but the inner
    // content frame will have the light theme still. I know how to fix the
    // themes with css, but I prefer to use the config options for consistency
    // and will get around to finding out what is going on when I get a chance.
    //
    // theme: seamThemeDark,
    // theme: seamThemeLight,

    showRoots: true,
    // docs: {
    //   iframeHeight: '60px',
    // },
  },
  viewports: INITIAL_VIEWPORTS
})

configure(require.context('../projects/ui-common/src', true, /\.stories\.(ts|mdx)$/), module)
