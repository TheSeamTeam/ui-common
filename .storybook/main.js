module.exports = {
  stories: ['../projects/ui-common/**/*.stories.@(ts|mdx)'],
  // stories: ['../projects/ui-common/breadcrumbs/stories/breadcrumbs-simple.stories.@(ts|mdx)'],
  logLevel: 'debug',
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-storysource',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    // '@storybook/addon-knobs',
    // '@storybook/addon-backgrounds',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-toolbars',
    '@storybook/addon-measure',
    'storybook-addon-outline',
    'storybook-dark-mode',
    '@storybook/addon-jest'
  ],
  core: {
    builder: 'webpack5',
  }
}
