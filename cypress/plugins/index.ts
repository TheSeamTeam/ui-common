// Plugins enable you to tap into, modify, or extend the internal behavior of Cypress
// For more info, visit https://on.cypress.io/plugins-api
// module.exports = (on, config) => {}

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



// import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin'
// import * as webpackConfig from './webpack.config'

// module.exports = (on, config) => {
//   addMatchImageSnapshotPlugin(on, config)
//   const { startDevServer } = require('@cypress/webpack-dev-server')

//   on('dev-server:start', (options) =>
//     startDevServer({
//       options,
//       webpackConfig,
//     }),
//   )
//   require('@cypress/code-coverage/task')(on, config)
//   return config
// }


// const webpackConfig = require('./webpack.config')
// const { startDevServer } = require('@cypress/webpack-dev-server')

// module.exports = (on, config) => {
//   on('dev-server:start', (options) =>
//     startDevServer({
//       options,
//       webpackConfig,
//     }),
//   )
//   return config
// }
