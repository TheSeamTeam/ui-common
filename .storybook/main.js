module.exports = {
  stories: [
    '../projects/ui-common/**/*.stories.@(ts|mdx)',
  ],
  // stories: ['../projects/ui-common/breadcrumbs/stories/breadcrumbs-simple.stories.@(ts|mdx)'],
  logLevel: 'debug',
  "framework": {
    "name": "@storybook/angular",
    "options": {},
  },
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    'storybook-dark-mode',
  ],
}
