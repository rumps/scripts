import extend from 'extend'
import gulp, {tasks} from 'gulp'
import rump from 'rump'
import webpack from 'webpack'
import {PluginError, colors, log} from 'gulp-util'

const {configs} = rump,
      {supportsColor} = colors,
      name = ::rump.taskName,
      task = ::gulp.task

task(name('build:scripts'), build)
tasks[name('build')].dep.push(name('build:scripts'))
tasks[name('watch')].dep.push(name('build:scripts'))

function build(callback) {
  let callbackCalled = false,
      options = configs.webpack

  if(configs.watch) {
    options = extend({}, options, {watch: true})
  }
  webpack(options, function(error, stats) {
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
  })
}
