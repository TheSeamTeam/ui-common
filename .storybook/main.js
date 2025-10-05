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
  webpackFinal: async (config, { angularBuilderOptions }) => {
    // Find the Sass rule
    const sassRule = config.module?.rules?.find(rule =>
      rule.test?.toString().includes('scss')
    )?.rules[1]

    if (sassRule) {
      // Update the sass-loader options
      sassRule.use = sassRule.use.map(loader => {
        if (typeof loader === 'object' && loader.loader?.includes('sass-loader')) {
          const _silenceDeprecations = [
            'mixed-decls',
            'color-functions',
            'global-builtin',
            'import',
          ]

          // NOTE: For this to work, Storybook's Angular builder schemas need to be patched to allow "sass" under "stylePreprocessorOptions"
          const builderSilenceDeprecations = angularBuilderOptions?.stylePreprocessorOptions?.sass?.silenceDeprecations || []

          const silenceDeprecations = [
            ...builderSilenceDeprecations,
            // Filter out duplicates
            ..._silenceDeprecations.filter(item => !builderSilenceDeprecations.includes(item)),
          ]

          const origFn = loader.options.sassOptions
          const wrappedFn = (...args) => {
            const result = origFn(...args)
            return {
              ...result,
              silenceDeprecations: [
                ...(result.silenceDeprecations || []),
                ...silenceDeprecations,
              ],
            }
          }

          return {
            ...loader,
            options: {
              ...loader.options,
              sassOptions: wrappedFn,
            },
          }
        }
        return loader
      })
    }

    return config
  }
}
