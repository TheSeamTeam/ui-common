module.exports = {
  stories: [
    // '../projects/ui-common/**/*.stories.@(ts|mdx)',
    '../projects/ui-common/**/*.stories.@(ts)',

    // '../src/**/*.mdx',
    // '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  // stories: ['../projects/ui-common/breadcrumbs/stories/breadcrumbs-simple.stories.@(ts|mdx)'],
  logLevel: 'debug',
  'framework': {
    'name': '@storybook/angular',
    'options': {},
  },
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
  ],
  docs: {},
}
