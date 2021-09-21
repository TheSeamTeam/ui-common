// // Plugins enable you to tap into, modify, or extend the internal behavior of Cypress
// // For more info, visit https://on.cypress.io/plugins-api
// module.exports = (on, config) => {
//   if (config.testingType === 'component') {
//     const { startDevServer } = require('@cypress/webpack-dev-server')

//     // Your project's Webpack configuration
//     // const webpackConfig = require('../../webpack.config.js')
//     const webpackConfig = {}

//     on('dev-server:start', (options) =>
//       startDevServer({ options, webpackConfig })
//     )
//   }
// }


import { startAngularDevServer } from '@jscutlery/cypress-angular'

module.exports = (on, config) => {
  on('dev-server:start', (options) =>
    startAngularDevServer({
      options,
      tsConfig: 'tsconfig.cypress.json',
      webpackConfig: {
        resolve: {
          fallback: { 'path': false }
        }
      }
    })
  )
  return config
}
