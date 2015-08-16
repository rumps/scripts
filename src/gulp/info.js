import gulp, {tasks} from 'gulp'
import rump from 'rump'
import webpack from 'webpack'
import {find} from 'globule'
import {colors} from 'gulp-util'
import {join, relative} from 'path'
import {version} from '../../package'

const {blue, green, magenta, yellow} = colors,
      {configs} = rump,
      {CommonsChunkPlugin} = webpack.optimize,
      name = ::rump.taskName,
      task = ::gulp.task

task(name('info:scripts'), () => {
  const {plugins} = configs.webpack,
        glob = join(configs.main.paths.source.root,
                    configs.main.paths.source.scripts,
                    configs.main.globs.build.scripts),
        files = find([glob].concat(configs.main.globs.global)),
        source = join(configs.main.paths.source.root,
                      configs.main.paths.source.scripts),
        destination = join(configs.main.paths.destination.root,
                           configs.main.paths.destination.scripts),
        commonFile = plugins.reduce((currentFile, plugin) => {
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
