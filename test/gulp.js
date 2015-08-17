import '../src'
import bufferEqual from 'buffer-equal'
import convert from 'convert-source-map'
import gulp from 'gulp'
import timeout from 'timeout-then'
import rump from 'rump'
import {colors} from 'gulp-util'
import {readFile, writeFile} from 'mz/fs'
import {resolve, sep} from 'path'
import {spy} from 'sinon'

const protocol = process.platform === 'win32' ? 'file:///' : 'file://',
      {stripColor} = colors

describe('tasks', function() {
  this.timeout(0)

  beforeEach(() => {
    rump.configure({
      environment: 'development',
      paths: {
        source: {root: 'test/fixtures', scripts: ''},
        destination: {root: 'tmp', scripts: ''},
      },
    })
  })

  it('are added and defined', () => {
    const callback = spy()
    rump.on('gulp:main', callback)
    rump.on('gulp:scripts', callback)
    rump.addGulpTasks({prefix: 'spec'})
    callback.should.be.calledTwice()
    gulp.tasks['spec:info:scripts'].should.be.ok()
    gulp.tasks['spec:build:scripts'].should.be.ok()
  })

  it('displays correct information in info task', () => {
    const logs = [],
          {log} = console
    console.log = (...args) => logs.push(stripColor(args.join(' ')))
    gulp.start('spec:info')
    console.log = log
    logs.slice(-7).should.eql([
      '',
      '--- Scripts v0.7.0',
      `Processed scripts from test${sep}fixtures are copied with source maps to tmp`,
      'Affected files:',
      'coffee.coffee',
      'index.js',
      '',
    ])
  })

  describe('for building', () => {
    let originals

    before(async() => {
      originals = await Promise.all([
        readFile('test/fixtures/index.js'),
        readFile('test/fixtures/lib/index.js'),
      ])
      await new Promise(resolve => {
        gulp.task('postbuild', ['spec:watch'], resolve)
        gulp.start('postbuild')
      })
    })

    beforeEach(() => timeout(1000))

    afterEach(() => Promise.all([
      writeFile('test/fixtures/index.js', originals[0]),
      writeFile('test/fixtures/lib/index.js', originals[1]),
    ]))

    it('handles updates', async() => {
      const firstContent = await readFile('tmp/index.js')
      await timeout(1000)
      await writeFile('test/fixtures/lib/index.js', 'module.exports = "";')
      await timeout(1000)
      bufferEqual(firstContent, await readFile('tmp/index.js')).should.be.false()
    })

    it('handles source maps in development', async() => {
      const js = readFile('tmp/index.js'),
            coffee = readFile('tmp/coffee.js'),
            contents = await Promise.all([js, coffee]),
            pathSet = contents
              .map(x => convert.fromSource(x.toString()))
              .map(x => x.getProperty('sources').sort()),
            paths = [].concat(...pathSet)
              .filter(x => x)
              .map(x => x.replace(protocol, '').split('/').join(sep))
              .filter(x => !x.startsWith('webpack'))
      paths.should.eql([
        resolve('node_modules/lodash/internal/isObjectLike.js'),
        resolve('node_modules/lodash/lang/isNumber.js'),
        resolve('test/fixtures/index.js'),
        resolve('test/fixtures/lib/index.js'),
        resolve('test/fixtures/coffee.coffee'),
        resolve('test/fixtures/lib/json.json'),
      ])
    })
  })
})
