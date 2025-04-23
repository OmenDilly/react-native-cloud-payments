const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const escape = require('escape-string-regexp')
const exclusionList = require('metro-config/src/defaults/exclusionList')

module.exports = (() => {
  const config = getDefaultConfig(__dirname)
  // Get the project root directory
  const projectRoot = __dirname
  const workspaceRoot = path.resolve(projectRoot, '..')

  // Read the package.json
  const pack = require('../package.json')
  const modules = Object.keys(pack.peerDependencies || {})

  const { transformer, resolver } = config

  config.transformer = {
    ...transformer,
  }

  config.resolver = {
    ...resolver,
    blacklistRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(
            `^${escape(path.join(workspaceRoot, 'node_modules', m))}\\/.*$`
          )
      )
    ),
    extraNodeModules: modules.reduce(
      (acc, name) => {
        acc[name] = path.join(projectRoot, 'node_modules', name)
        return acc
      },
      {
        // Link our local package
        '@omendilly/react-native-cloud-payments': path.join(
          projectRoot,
          'node_modules',
          '@omendilly/react-native-cloud-payments'
        ),
      }
    ),
  }

  config.projectRoot = projectRoot
  config.watchFolders = [workspaceRoot]

  return config
})()
