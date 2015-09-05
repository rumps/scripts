import gulp, {tasks} from 'gulp'
import rump from 'rump'
import {optimize} from 'webpack'
import {find} from 'globule'
import {colors} from 'gulp-util'
import {join, relative} from 'path'
import {version} from '../../package'

const name = ::rump.taskName
const task = ::gulp.task
const {blue, green, magenta, yellow} = colors
const {CommonsChunkPlugin} = optimize
const {configs} = rump

task(name('info:scripts'), () => {
  const {plugins} = configs.webpack
  const glob = join(configs.main.paths.source.root,
                    configs.main.paths.source.scripts,
                    configs.main.globs.build.scripts)
  const files = find([glob].concat(configs.main.globs.global))
  const source = join(configs.main.paths.source.root,
                      configs.main.paths.source.scripts)
  const destination = join(configs.main.paths.destination.root,
                           configs.main.paths.destination.scripts)
  const commonFile = plugins.reduce((currentFile, plugin) => {
    return !currentFile && plugin instanceof CommonsChunkPlugin
      ? join(configs.main.paths.destination.root,
             configs.main.paths.destination.scripts,
             plugin.filenameTemplate)
      : currentFile
  }, null)
  let action = 'copied'

  if(!files.length) {
    return
  }
  switch(configs.main.environment) {
  case 'development':
    action = `copied ${yellow('with source maps')}`
    break
  case 'production':
    action = `${yellow('minified')} and copied`
    break
  default:
    break
  }
  console.log()
  console.log(magenta(`--- Scripts v${version}`))
  console.log(`Processed scripts from ${green(source)} are ${action}`,
              `to ${green(destination)}`)
  if(configs.main.scripts.common && commonFile) {
    console.log('Common modules across processed scripts',
                `are built into ${green(commonFile)}`)
  }
  console.log('Affected files:')
  files.forEach(file => console.log(blue(relative(source, file))))
  console.log()
})

tasks[name('info')].dep.push(name('info:scripts'))
