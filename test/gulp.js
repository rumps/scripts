import '../src'
import bufferEqual from 'buffer-equal'
import convert from 'convert-source-map'
import gulp from 'gulp'
import timeout from 'timeout-then'
import rump from 'rump'
import {colors} from 'gulp-util'
import {exists, readFile, writeFile} from 'mz/fs'
import {resolve, sep} from 'path'
import {spy} from 'sinon'

const protocol = process.platform === 'win32' ? 'file:///' : 'file://'
const {stripColor} = colors

describe('tasks', function describeTasks() {
  this.timeout(0)

  afterEach(() => {
    rump.configure({
      environment: 'development',
      paths: {
        source: {root: 'test/fixtures', scripts: ''},
        destination: {root: 'tmp', scripts: ''},
      },
      scripts: {common: true},
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
    const logs = []
    const {log} = console
    console.log = newLog
    gulp.start('spec:info')
    console.log = log
    logs.slice(-8).should.eql([
      '',
      '--- Scripts v0.8.1',
      `Processed scripts from test${sep}fixtures are copied with source maps to tmp`,
      `Common modules across processed scripts are built into tmp${sep}common.js`,
      'Affected files:',
      'coffee.coffee',
      'index.js',
      '',
    ])
    logs.length = 0
    console.log = newLog
    gulp.start('spec:info:prod')
    console.log = log
    logs.slice(-8).should.eql([
      '',
      '--- Scripts v0.8.1',
      `Processed scripts from test${sep}fixtures are minified and copied to tmp`,
      `Common modules across processed scripts are built into tmp${sep}common.js`,
      'Affected files:',
      'coffee.coffee',
      'index.js',
      '',
    ])
    rump.reconfigure({paths: {source: {scripts: 'nonexistant'}}})
    logs.length = 0
    console.log = newLog
    gulp.start('spec:info')
    console.log = log
    logs.length.should.not.be.above(4)

    function newLog(...args) {
      logs.push(stripColor(args.join(' ')))
    }
  })

  it('for building', async() => {
    await new Promise(resolve => {
      gulp.task('postbuild', ['spec:build'], resolve)
      gulp.start('postbuild')
    })
    const filesExists = await Promise.all([
      exists('tmp/coffee.js'),
      exists('tmp/common.js'),
      exists('tmp/index.js'),
    ])
    filesExists.forEach(x => x.should.be.true())
  })

  describe('for watching', () => {
    let originals

    before(async() => {
      originals = await Promise.all([
        readFile('test/fixtures/index.js'),
        readFile('test/fixtures/lib/index.js'),
      ])
      await new Promise(resolve => {
        gulp.task('postwatch', ['spec:watch'], resolve)
        gulp.start('postwatch')
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
      const js = readFile('tmp/index.js')
      const coffee = readFile('tmp/coffee.js')
      const common = readFile('tmp/common.js')
      const contents = await Promise.all([common, js, coffee])
      const pathSet = contents
              .map(x => convert.fromSource(x.toString()))
              .map(x => x.getProperty('sources').sort())
      const paths = [].concat(...pathSet)
              .filter(x => x)
              .map(x => x.replace(protocol, '').split('/').join(sep))
      paths.should.have.length(11)
      paths.filter(x => x.indexOf('webpack') !== 0).should.eql([
        resolve('node_modules/riot/riot.js'),
        resolve('test/fixtures/lib/html.html'),
        resolve('node_modules/lodash/internal/isObjectLike.js'),
        resolve('node_modules/lodash/lang/isNumber.js'),
        resolve('test/fixtures/index.js'),
        resolve('test/fixtures/lib/index.js'),
        resolve('test/fixtures/tags/type.tag'),
        resolve('test/fixtures/coffee.coffee'),
        resolve('test/fixtures/lib/json.json'),
        resolve('test/fixtures/tags/name.tag'),
      ])
    })
  })
})
