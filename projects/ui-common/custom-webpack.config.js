const webpack = require('webpack')

module.exports = (config, options) => {
  // const isDev = config.mode === 'development'

  // config.plugins.push(
  //   new webpack.DefinePlugin({
  //     'VERSION': JSON.stringify(getVersion(isDev))
  //   })
  // )
  // config.resolve.fallback: { "path": false }

  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      path: false
    }
  }

  return config
}
