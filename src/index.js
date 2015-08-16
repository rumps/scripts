import rump from 'rump'
import {rebuild} from './configs'

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
