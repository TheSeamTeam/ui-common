module.exports = {
  stories: ['../projects/ui-common/src/**/*.stories.@(ts|mdx)'],
  logLevel: 'debug',
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-storysource',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-knobs',
    '@storybook/addon-backgrounds',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport'
  ],
}
