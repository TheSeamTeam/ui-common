import { withA11y } from '@storybook/addon-a11y'
import { setCompodocJson } from '@storybook/addon-docs/angular'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { addDecorator, addParameters, configure } from '@storybook/angular'
import { themes } from '@storybook/theming'

import { seamTheme } from './theme'

// @ts-ignore
// eslint-disable-next-line import/extensions, import/no-unresolved
import docJson from '../documentation.json'

setCompodocJson(docJson)

addDecorator(withA11y)

// Option defaults.
addParameters({
  options: {
    // theme: themes.dark,
    theme: seamTheme,
    showRoots: true,
    // docs: {
    //   iframeHeight: '60px',
    // },
  },
  viewports: INITIAL_VIEWPORTS
})

configure(require.context('../projects/ui-common/src', true, /\.stories\.(ts|mdx)$/), module)
