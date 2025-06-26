import chalk from 'chalk'
import { exec } from 'child_process'
import { Command } from 'commander'
import detectFreePort from 'detect-port'
import fs from 'fs'
import yaml from 'js-yaml'
import nodeCleanup from 'node-cleanup'
import path from 'path'
import dedent from 'ts-dedent'

import pLimit from 'p-limit'
import startVerdaccioServer from 'verdaccio'

import { maxConcurrentTasks } from './utils/concurrency'
import { isYarnInstalled } from './utils/is-yarn-installed'

const program = new Command()

program
  .option('-O, --open', 'keep process open')
  .option('-P, --publish', 'should publish packages')
  .option('-p, --port <port>', 'port to run https server on')

program.parse(process.argv)

const logger = console

const yarnInstalled = isYarnInstalled()

const freePort = (port?: number) => port || detectFreePort(port)

const startVerdaccio = (port: number) => {
  let resolved = false
  return Promise.race([
    new Promise(resolve => {
      const cache = path.join(__dirname, '..', '.verdaccio-cache')
      const config = {
        ...(yaml.load(
          fs.readFileSync(path.join(__dirname, 'verdaccio.yaml'), 'utf8')
        ) as Record<string, any>),
        self_path: cache,
      }

      const onReady = (webServer: any) => {
        webServer.listen(port, () => {
          resolved = true
          resolve(webServer)
        })
      }

      startVerdaccioServer(config, 6000, cache, '1.0.0', 'verdaccio', onReady)
    }),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          reject(new Error(`TIMEOUT - verdaccio didn't start within 60s`))
        }
      }, 60000)
    }),
  ])
}
const registryUrl = (command: string, url?: string) =>
  new Promise<string>((resolve, reject) => {
    // TODO: Implement a better way to omit yarn.
    if (command === 'yarn' && !yarnInstalled) {
      resolve('')
      return
    }

    const args = url ? ['config', 'set', 'registry', url] : ['config', 'get', 'registry']
    const cmd = `${command} ${args.join(' ')}`
    logger.log(`exec: ${cmd}`)
    exec(cmd, (e, stdout) => {
      if (e) {
        logger.log(`[Error] exec: ${cmd}`)
        logger.error(e)
        reject(e)
      } else {
        logger.log(`[Success] exec: ${cmd}`, stdout.toString().trim())
        resolve(url || stdout.toString().trim())
      }
    })
  })

const registriesUrl = (yarnUrl?: string, npmUrl?: string) =>
  Promise.all([registryUrl('yarn', yarnUrl), registryUrl('npm', npmUrl || yarnUrl)])

const applyRegistriesUrl = (
  yarnUrl: string,
  npmUrl: string,
  originalYarnUrl: string,
  originalNpmUrl: string
) => {
  logger.log(`↪️  changing system config`)
  nodeCleanup((exitCode, signal) => {
    registriesUrl(originalYarnUrl, originalNpmUrl)
      .then(() => registriesUrl())
      .then(v => {
        logger.log('~v', v)
        process.kill(process.pid, signal)
      })
      .catch(err => logger.error('~err', err))

    logger.log(dedent`
      Your registry config has been restored from:
      npm: ${npmUrl} to ${originalNpmUrl}
      yarn: ${yarnUrl} to ${originalYarnUrl}
    `)
    nodeCleanup.uninstall()
    return false
  })

  return registriesUrl(yarnUrl, npmUrl)
}

const publish = (packages: { name: string; location: string }[], url: string) => {
  logger.log(`Publishing packages with a concurrency of ${maxConcurrentTasks}`)

  const limit = pLimit(maxConcurrentTasks)
  let i = 0

  return Promise.all(
    packages.map(({ name, location }) =>
      limit(
        () =>
          new Promise((resolve, reject) => {
            logger.log(`🛫 publishing ${name} (${location})`)
            const command = `cd ${location} && npm publish --registry ${url} --force --access restricted`
            exec(command, e => {
              if (e) {
                reject(e)
              } else {
                i += 1
                logger.log(`${i}/${packages.length} 🛬 successful publish of ${name}!`)
                resolve(undefined)
              }
            })
          })
      )
    )
  )
}

const addUser = (url: string) =>
  new Promise<void>((resolve, reject) => {
    logger.log(`👤 add temp user to verdaccio ${process.env.NPM_REGISTRY}`)

    exec(`npx npm-cli-adduser -r "${url}" -a -u user -p password -e user@example.com`, e => {
      if (e) {
        reject(e)
      } else {
        resolve()
      }
    })
  })

const run = async () => {
  const options = program.opts()
  const port = await freePort(options.port)
  logger.log(`🌏 found a open port: ${port}`)

  const verdaccioUrl = `http://localhost:${port}`

  logger.log(`🔖 reading current registry settings`)
  let [originalYarnRegistryUrl, originalNpmRegistryUrl] = await registriesUrl()
  if (
    originalYarnRegistryUrl.includes('localhost') ||
    originalNpmRegistryUrl.includes('localhost')
  ) {
    originalYarnRegistryUrl = 'https://registry.npmjs.org/'
    originalNpmRegistryUrl = 'https://registry.npmjs.org/'
  }

  console.log({ originalYarnRegistryUrl, originalNpmRegistryUrl })

  logger.log(`🎬 starting verdaccio (this takes ±5 seconds, so be patient)`)

  const verdaccioServer: any = startVerdaccio(port)

  logger.log(`🌿 verdaccio running on ${verdaccioUrl}`)

  await applyRegistriesUrl(
    verdaccioUrl,
    verdaccioUrl,
    originalYarnRegistryUrl,
    originalNpmRegistryUrl
  )

  await addUser(verdaccioUrl)

  if (options.publish) {
    await publish([
      { name: '@theseam/ui-common', location: path.join(__dirname, '../dist/ui-common') }
    ], verdaccioUrl)
  }

  if (!options.open) {
    verdaccioServer.close()
  }
}

run().catch(e => {
  logger.error(e)
  process.exit(1)
})
