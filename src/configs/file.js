import {resolve} from 'path'
import {ProvidePlugin} from 'webpack'

const aliases = {},
      extensions = ['.js'],
      globExtensions = ['js'],
      loaders = [],
      plugins = [],
      pkg = require(resolve('package')),
      {dependencies = {}} = pkg,
      {devDependencies = {}} = pkg,
      {optionalDependencies = {}} = pkg,
      {peerDependencies = {}} = pkg,
      keys1 = Object.keys(dependencies),
      keys2 = Object.keys(devDependencies),
      keys3 = Object.keys(optionalDependencies),
      keys4 = Object.keys(peerDependencies),
      modules = [...keys1, ...keys2, ...keys3, ...keys4]
let glob

// JSON
if(moduleExists('json-loader')) {
  extensions.push('.json')
  loaders.push({
    test: /\.json$/,
    loaders: ['json-loader'],
  })
}

// JS with Babel (auto self contain if Babel runtime is available)
// TODO drop runtime check in next major version (.babelrc can handle it)
if(moduleExists('babel-loader')) {
  const loader = {
    test: /^(?!.*(bower_components|node_modules))+.+\.jsx?$/,
    loaders: ['babel-loader'],
  }
  extensions.push('.jsx')
  globExtensions.push('jsx')
  loaders.push(loader)
  if(moduleExists('babel-runtime', 'babel-runtime/package')) {
    loader.loaders[0] += '?optional[]=runtime'
  }
}

// CoffeeScript
if(moduleExists('coffee-loader')) {
  extensions.push('.coffee', '.coffee.md', '.litcoffee')
  globExtensions.push('coffee', 'coffee.md', 'litcoffee')
  loaders.push({
    test: /\.coffee$/,
    loaders: ['coffee-loader'],
  })
  loaders.push({
    test: /\.(coffee\.md|litcoffee)$/,
    loaders: ['coffee-loader?literate'],
  })
}

// HTML
if(moduleExists('html-loader')) {
  extensions.push('.html')
  loaders.push({
    test: /\.html$/,
    loaders: ['html-loader?-minimize'],
  })
}

// Riot
if(moduleExists('riotjs-loader')) {
  extensions.push('.tag')
  globExtensions.push('tag')
  loaders.push({
    test: /\.tag$/,
    loaders: ['riotjs-loader'],
  })
  plugins.push(new ProvidePlugin({riot: 'riot'}))
}

// Build glob
glob = globExtensions.length > 1
  ? `*.{${globExtensions.join(',')}}`
  : `*.${globExtensions[0]}`

export {aliases, extensions, glob, loaders, plugins}

function moduleExists(mod, path = mod) {
  if(modules.includes(mod)) {
    try {
      require.resolve(path)
      return true
    }
    catch(e) {
      return false
    }
  }
  return false
}
