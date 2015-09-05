import extend from 'extend'
import rump from 'rump'
import webpack from './webpack'
import {aliases, glob, loaders} from './file'

const {configs} = rump

rebuild()

export function rebuild() {
  configs.main.globs = extend(true, {build: {
    scripts: glob,
    tests: `**/${glob.replace(/^\*\./, '*_test.')}`,
  }}, configs.main.globs)
  configs.main.paths = extend(true, {
    source: {scripts: 'scripts'},
    destination: {scripts: 'scripts'},
  }, configs.main.paths)
  configs.main.scripts = extend(true, {
    aliases: [...aliases],
    loaders: [...loaders],
    minify: configs.main.environment === 'production',
    sourceMap: configs.main.environment === 'development',
    macros: {
      'process.env.NODE_ENV': JSON.stringify(configs.main.environment),
    },
  }, configs.main.scripts)
  configs.main.scripts.uglifyjs = extend(true, {
    output: {comments: false},
    compress: {drop_console: true, drop_debugger: true},
  }, configs.main.scripts.uglifyjs)
  configs.main.scripts.webpack = webpack()
}
