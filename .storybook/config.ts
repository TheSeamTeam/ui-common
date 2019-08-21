import { withA11y } from '@storybook/addon-a11y'
import { addDecorator, addParameters, configure } from '@storybook/angular'
// import { themes } from '@storybook/theming'

addDecorator(withA11y)

// Option defaults.
addParameters({
  options: {
    // theme: themes.dark,
    // hierarchyRootSeparator: /\|/,
    // docs: {
    //   iframeHeight: '60px',
    // },
  },
})

configure(require.context('../projects/ui-common/src', true, /\.stories\.(ts|mdx)$/), module)
