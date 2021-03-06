import extend from 'extend'
import rump from 'rump'
import {find} from 'globule'
import {basename, extname, join, resolve, sep} from 'path'
import {DefinePlugin, ResolverPlugin, optimize} from 'webpack'
import {extensions, plugins} from './file'

const DescPlugin = ResolverPlugin.DirectoryDescriptionFilePlugin,
      protocol = process.platform === 'win32' ? 'file:///' : 'file://',
      {configs} = rump,
      {CommonsChunkPlugin, DedupePlugin} = optimize,
      {UglifyJsPlugin, OccurrenceOrderPlugin} = optimize

export default function() {
  let commonsChunk = 'common'
  const source = join(configs.main.paths.source.root,
                      configs.main.paths.source.scripts),
        destination = join(configs.main.paths.destination.root,
                           configs.main.paths.destination.scripts),
        options = {
          entry: entries(),
          output: {path: destination, filename: '[name].js'},
          module: {loaders: configs.main.scripts.loaders},
          plugins: plugins.concat([
            new ResolverPlugin(new DescPlugin('package.json', [
              'webpack',
              'browser',
              'web',
              'browserify',
              ['jam', 'main'],
              'main',
            ])),
            new ResolverPlugin(new DescPlugin('bower.json', ['main'])),
            new DefinePlugin(configs.main.scripts.macros),
          ]),
          resolve: {
            alias: configs.main.scripts.aliases,
            extensions: [''].concat(extensions),
            modulesDirectories: ['node_modules', 'bower_components'],
            root: resolve(source),
          },
          watchOptions: {aggregateTimeout: 200},
        }

  if(configs.main.scripts.sourceMap) {
    options.debug = true
    options.devtool = 'inline-source-map'
    options.output.devtoolModuleFilenameTemplate = filenameTemplate
  }
  if(configs.main.scripts.minify) {
    options.plugins.push(new UglifyJsPlugin(configs.uglifyjs))
    options.plugins.push(new OccurrenceOrderPlugin())
    options.plugins.push(new DedupePlugin())
  }
  if(configs.main.scripts.common) {
    if(typeof configs.main.scripts.common === 'string') {
      commonsChunk = configs.main.scripts.common
    }
    options.plugins.push(new CommonsChunkPlugin(commonsChunk,
                                                `${commonsChunk}.js`))
  }
  if(configs.main.scripts.library) {
    options.output.library = configs.main.scripts.library
    options.output.libraryTarget = 'umd'
  }
  return extend(true, options, configs.main.scripts.webpack)
}

function entries() {
  const source = join(configs.main.paths.source.root,
                      configs.main.paths.source.scripts,
                      configs.main.globs.build.scripts)

  return find([source].concat(rump.configs.main.globs.global))
    .map(filename => basename(filename))
    .reduce((obj, filename) => {
      obj[basename(filename, extname(filename))] = filename
      return obj
    }, {})
}

function filenameTemplate({absoluteResourcePath}) {
  return `${protocol}${absoluteResourcePath.split(sep).join('/')}`
}
