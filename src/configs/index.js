import extend from 'extend'
import rump from 'rump'
import webpack from './webpack'
import {aliases, loaders, glob} from './file'

const {configs} = rump,
      dropConsoleKey = 'drop_console',
      dropDebuggerKey = 'drop_debugger'

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
    aliases,
    loaders,
    minify: configs.main.environment === 'production',
    sourceMap: configs.main.environment === 'development',
    macros: {
      'process.env.NODE_ENV': JSON.stringify(configs.main.environment),
    },
  }, configs.main.scripts)
  configs.main.scripts.uglifyjs = extend(true, {
    output: {comments: false},
    compress: {[dropConsoleKey]: true, [dropDebuggerKey]: true},
  }, configs.main.scripts.uglifyjs)
  configs.main.scripts.webpack = webpack()
}
