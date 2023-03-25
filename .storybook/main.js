
// const isStylingRule = (rule) => {
//   const { test } = rule;

//   if (!test) {
//     return false;
//   }

//   if (!(test instanceof RegExp)) {
//     return false;
//   }

//   return test.test('.css') || test.test('.scss') || test.test('.sass');
// };

// export const filterOutStylingRules = (config) => {
//   return (config.module.rules).filter((rule) => !isStylingRule(rule));
// };

module.exports = {
  stories: [
    '../projects/ui-common/**/*.stories.@(ts|mdx)',
  ],
  // stories: ['../projects/ui-common/breadcrumbs/stories/breadcrumbs-simple.stories.@(ts|mdx)'],
  logLevel: 'debug',
  // framework: '@storybook/angular',
  "framework": {
    "name": "@storybook/angular",
    "options": {}
  },
  addons: [
    // '@storybook/addon-docs',
    // '@storybook/addon-controls',
    '@storybook/addon-essentials',
    // '@storybook/addon-storysource',
    // '@storybook/addon-actions',
    '@storybook/addon-links',
    // '@storybook/addon-backgrounds',
    '@storybook/addon-a11y',
    // '@storybook/addon-viewport',
    // '@storybook/addon-toolbars',
    // '@storybook/addon-measure',
    // '@storybook/addon-outline',
    '@storybook/addon-interactions',
    'storybook-dark-mode',
  ],
  // core: {
  //   builder: 'webpack5',
  // },
  // features: {
  //   // storyStoreV7: true,
  //   interactionsDebugger: true,
  // },
  webpackFinal: (config) => {
    console.log(config);
    // console.log(config.plugins[6]);
    // console.log(config.plugins[6].options.entryPoints);
    console.log('----');
    // console.log(config.module.rules);
    // console.log(config.module.rules[5]);
    // const _config = {
    //   ...config,
    //   module: {
    //     ...config.module,
    //     rules: [
    //       // ...config.module.rules,
    //       ...filterOutStylingRules(config),
    //     ],
    //   },
    // }
    // console.log(_config);
    return config
  }
}
