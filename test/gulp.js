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

const {stripColor} = colors,
      protocol = process.platform === 'win32' ? 'file:///' : 'file://'

describe('tasks', function() {
  this.timeout(0)

  beforeEach(() => {
    rump.configure({
      environment: 'development',
      paths: {
        source: {root: 'test/src', scripts: ''},
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
    logs.slice(-6).should.eql([
      '',
      '--- Scripts v0.7.0',
      `Processed scripts from test${sep}src are copied with source maps to tmp`,
      'Affected files:',
      'index.js',
      '',
    ])
  })

  describe('for building', () => {
    let originals

    before(async(done) => {
      originals = await Promise.all([
        readFile('test/src/index.js'),
        readFile('test/src/lib/index.js'),
      ])
      gulp.task('postbuild', ['spec:watch'], () => done())
      gulp.start('postbuild')
    })

    afterEach(async() => {
      await timeout(1000)
      await Promise.all([
        writeFile('test/src/index.js', originals[0]),
        writeFile('test/src/lib/index.js', originals[1]),
      ])
      await timeout(1000)
    })

    it('handles updates', async() => {
      const firstContent = await readFile('tmp/index.js')
      let secondContent
      await timeout(1000)
      await writeFile('test/src/lib/index.js', 'module.exports = "";')
      await timeout(1000)
      secondContent = await readFile('tmp/index.js')
      bufferEqual(firstContent, secondContent).should.be.false()
    })

    it('handles source maps in development', async() => {
      const content = await readFile('tmp/index.js'),
            paths = convert
              .fromSource(content.toString())
              .getProperty('sources')
              .sort()
              .filter(x => x)
              .map(x => x.replace(protocol, '').split('/').join(sep))
      paths.should.eql([
        resolve('test/src/index.js'),
      ])
    })
  })
})
