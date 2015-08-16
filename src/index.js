import rump from 'rump'
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers'
import {existsSync} from 'fs'
import {sep} from 'path'
import {rebuild} from './configs'

const protocol = process.platform === 'win32' ? 'file:///' : 'file://'

rump.on('update:main', () => {
  rebuild()
  rump.emit('update:scripts')
})

rump.on('gulp:main', (...args) => {
  require('./gulp')
  rump.emit('gulp:scripts', ...args)
})

Object.defineProperty(rump.configs, 'uglifyjs', {
  get: () => rump.configs.main.scripts.uglifyjs,
})

Object.defineProperty(rump.configs, 'webpack', {
  get: () => rump.configs.main.scripts.webpack,
})

// Rewrite source map URL for consistency
ModuleFilenameHelpers.createFilename = (module) => {
  const url = typeof module === 'string'
          ? module.split('!').pop()
          : module.resourcePath || module.identifier().split('!').pop()
  return existsSync(url) ? `${protocol}${url.split(sep).join('/')}` : ''
}
