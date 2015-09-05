import extend from 'extend'
import gulp, {tasks} from 'gulp'
import rump from 'rump'
import webpack from 'webpack'
import {PluginError, colors, log} from 'gulp-util'

const name = ::rump.taskName
const task = ::gulp.task
const {configs} = rump
const {supportsColor} = colors

task(name('build:scripts'), build)
tasks[name('build')].dep.push(name('build:scripts'))
tasks[name('watch')].dep.push(name('build:scripts'))

function build(callback) {
  const options = extend({}, configs.webpack)
  const {watchOptions} = options
  let callbackCalled = false
  let compiler

  delete options.watchOptions
  compiler = webpack(options)
  if(configs.watch) {
    compiler.watch(watchOptions, handler)
  }
  else {
    compiler.run(handler)
  }

  function handler(error, stats) {
    if(error) {
      throw new PluginError(name('build:scripts'), error)
    }
    else if(callbackCalled) {
      log(stats.toString({
        assets: false,
        chunks: false,
        colors: supportsColor,
        hash: false,
        modules: false,
        reasons: false,
        source: false,
      }))
    }
    else {
      callbackCalled = true
      log(stats.toString({colors: supportsColor}))
      return callback()
    }
  }
}
