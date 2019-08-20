const path = require('path');

module.exports = baseConfig => {
  baseConfig.config.module.rules.push({
    test: [/\.stories\.tsx?$/, /index\.ts$/],
    loaders: [
      {
        loader: require.resolve('@storybook/addon-storysource/loader'),
        options: {
          parser: 'typescript'
        }
      }
    ],
    include: [path.resolve(__dirname, '../projects/ui-common/src')],
    enforce: 'pre'
  });

  return baseConfig.config;
};
