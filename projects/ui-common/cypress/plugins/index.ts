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
// import { webpackFinal } from '@storybook/angular/dist/ts3.9/server/framework-preset-angular-cli'
// import { webpackFinal } from '@storybook/angular/dist/ts3.9/server/framework-preset-angular-cli.js'








// import { Target, targetFromTargetString } from '@angular-devkit/architect'
// import { workspaces } from '@angular-devkit/core'
// import { Options as CoreOptions } from '@storybook/core-common'
// import { logger } from '@storybook/node-logger'
// import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
// import webpack from 'webpack'

// import {
//   AngularCliWebpackConfig,
//   extractAngularCliWebpackConfig,
// } from '@storybook/angular/dist/ts3.9/server/angular-devkit-build-webpack'
// import {
//   findAngularProjectTarget,
//   getDefaultProjectName,
//   readAngularWorkspaceConfig,
// } from '@storybook/angular/dist/ts3.9/server/angular-read-workspace'
// import { filterOutStylingRules } from '@storybook/angular/dist/ts3.9/server/utils/filter-out-styling-rules'
// import { moduleIsAvailable } from '@storybook/angular/dist/ts3.9/server/utils/module-is-available'


// export type Options = CoreOptions & {
//   angularBrowserTarget?: string;
// }

// export async function webpackFinal(baseConfig: webpack.Configuration, options: Options) {
//   const dirToSearch = process.cwd() + '/../../'

//   if (!moduleIsAvailable('@angular-devkit/build-angular')) {
//     logger.info('=> Using base config because "@angular-devkit/build-angular" is not installed')
//     return baseConfig
//   }
//   logger.info('=> Loading angular-cli config')

//   // Read angular workspace
//   let workspaceConfig
//   try {
//     workspaceConfig = await readAngularWorkspaceConfig(dirToSearch)
//   } catch (error) {
//     logger.error(
//       `=> Could not find angular workspace config (angular.json) on this path "${dirToSearch}"`
//     )
//     logger.info(`=> Fail to load angular-cli config. Using base config`)
//     return baseConfig
//   }

//   // Find angular project target
//   let project: workspaces.ProjectDefinition
//   let target: workspaces.TargetDefinition
//   let browserTarget
//   try {
//     browserTarget = options.angularBrowserTarget
//       ? targetFromTargetString(options.angularBrowserTarget)
//       : ({
//           configuration: undefined,
//           project: getDefaultProjectName(workspaceConfig),
//           target: 'build',
//         } as Target)

//     const fondProject = findAngularProjectTarget(
//       workspaceConfig,
//       browserTarget.project,
//       browserTarget.target
//     )
//     project = fondProject.project
//     target = fondProject.target
//     logger.info(
//       `=> Using angular project "${browserTarget.project}:${browserTarget.target}" for configuring Storybook`
//     )
//   } catch (error) {
//     logger.error(`=> Could not find angular project: ${error.message}`)
//     logger.info(`=> Fail to load angular-cli config. Using base config`)
//     return baseConfig
//   }

//   // Use angular-cli to get some webpack config
//   let angularCliWebpackConfig
//   try {
//     angularCliWebpackConfig = await extractAngularCliWebpackConfig(dirToSearch, project, target)
//     logger.info(`=> Using angular-cli webpack config`)
//   } catch (error) {
//     logger.error(`=> Could not get angular cli webpack config`)
//     throw error
//   }

//   return mergeAngularCliWebpackConfig(angularCliWebpackConfig, baseConfig)
// }

// function mergeAngularCliWebpackConfig(
//   { cliCommonWebpackConfig, cliStyleWebpackConfig, tsConfigPath }: AngularCliWebpackConfig,
//   baseConfig: webpack.Configuration
// ) {
//   // Don't use storybooks styling rules because we have to use rules created by @angular-devkit/build-angular
//   // because @angular-devkit/build-angular created rules have include/exclude for global style files.
//   const rulesExcludingStyles = filterOutStylingRules(baseConfig)

//   // styleWebpackConfig.entry adds global style files to the webpack context
//   const entry = [
//     ...(baseConfig.entry as string[]),
//     // @ts-ignore
//     ...Object.values(cliStyleWebpackConfig.entry).reduce((acc, item) => acc.concat(item), []),
//   ]

//   const module = {
//     ...baseConfig.module,
//     rules: [...cliStyleWebpackConfig.module.rules, ...rulesExcludingStyles],
//   }

//   // We use cliCommonConfig plugins to serve static assets files.
//   const plugins = [
//     ...cliStyleWebpackConfig.plugins,
//     ...cliCommonWebpackConfig.plugins,
//     // @ts-ignore
//     ...baseConfig.plugins,
//   ]

//   const resolve = {
//     ...baseConfig.resolve,
//     modules: Array.from(
//       // @ts-ignore
//       new Set([...baseConfig.resolve.modules, ...cliCommonWebpackConfig.resolve.modules])
//     ),
//     plugins: [
//       new TsconfigPathsPlugin({
//         configFile: tsConfigPath,
//         mainFields: ['browser', 'module', 'main'],
//       }),
//     ],
//   }

//   return {
//     ...baseConfig,
//     entry,
//     module,
//     plugins,
//     resolve,
//     resolveLoader: cliCommonWebpackConfig.resolveLoader,
//   }
// }













module.exports = (on: any, config: any) => {
  // const t = {
  //   entry: [],
  //   module: {
  //     rules: []
  //   },
  //   plugins: [],
  //   resolve: {
  //     modules: []
  //   }
  // }
  // const tmp = (webpackFinal(t as any, {} as any) as any).then((r: any) => {
  //   console.log('~~~~~~~~~', r)
  //   r.resolve.fallback: {  }

  //   on('dev-server:start', (options: any) =>
  //     startAngularDevServer({
  //       options,
  //       tsConfig: 'tsconfig.cypress.json',
  //       webpackConfig: r
  //       // webpackConfig: {
  //       //   resolve: {
  //       //     fallback: { 'path': false }
  //       //   },
  //       //   node: {
  //       //     global: true
  //       //   }
  //       // }
  //     })
  //   )
  // })

  // on('before:browser:launch', (browser: any = {}, args: any) => {

  //   if (browser.name === 'chrome') {
  //     // args.push('--remote-debugging-port=9222')

  //     // whatever you return here becomes the new args
  //     return args
  //   }

  // })

  on('dev-server:start', (options: any) =>
    startAngularDevServer({
      options,
      tsConfig: 'tsconfig.cypress.json',
      webpackConfig: {
        resolve: {
          fallback: { 'path': false }
        },
        node: {
          global: true
        }
      }
    })
  )
  return config
}
