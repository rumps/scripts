'use strict';

// Temporary fix until old LoDash is updated in some Gulp dependency
Object.getPrototypeOf.toString = function() {
  return 'function getPrototypeOf() { [native code] }';
};

var assert = require('assert');
var bufferEqual = require('buffer-equal');
var co = require('co');
var convert = require('convert-source-map');
var fs = require('mz/fs');
var gulp = require('gulp');
var util = require('gulp-util');
var path = require('path');
var sinon = require('sinon');
var sleep = require('timeout-then');
var rump = require('../lib');
var protocol = process.platform === 'win32' ? 'file:///' : 'file://';

describe('rump scripts tasks', function() {
  beforeEach(function() {
    rump.configure({
      environment: 'development',
      paths: {
        source: {
          root: 'test/src/js',
          scripts: ''
        },
        destination: {
          root: 'tmp',
          scripts: ''
        }
      }
    });
  });

  it('are added and defined', function() {
    var callback = sinon.spy();
    rump.on('gulp:main', callback);
    rump.on('gulp:scripts', callback);
    rump.addGulpTasks({prefix: 'spec'});
    // TODO Remove no callback check on next major core update
    assert(!callback.called || callback.calledTwice);
    assert(gulp.tasks['spec:info:scripts']);
    assert(gulp.tasks['spec:build:scripts']);
  });

  it('displays correct information in info task', function() {
    var oldLog = console.log;
    var logs = [];
    console.log = function() {
      logs.push(util.colors.stripColor(Array.from(arguments).join(' ')));
    };
    gulp.start('spec:info');
    console.log = oldLog;
    assert(logs.some(hasPaths));
    assert(logs.some(hasJsFile));
    assert(!logs.some(hasLibFile));
  });

  describe('for building', function() {
    var originals;

    before(co.wrap(function*() {
      originals = yield [
        fs.readFile('test/src/js/index.js'),
        fs.readFile('test/src/js/lib/index.js')
      ];
    }));

    before(function(done) {
      gulp.task('postbuild', ['spec:watch'], function() {
        done();
      });
      gulp.start('postbuild');
    });

    afterEach(co.wrap(function*() {
      yield sleep(800);
      yield [
        fs.writeFile('test/src/js/index.js', originals[0]),
        fs.writeFile('test/src/js/lib/index.js', originals[1])
      ];
      yield sleep(800);
    }));

    it('handles updates', co.wrap(function*() {
      var firstContent = yield fs.readFile('tmp/index.js');
      yield sleep(800);
      fs.writeFileSync('test/src/js/lib/index.js', 'module.exports = "";');
      yield sleep(800);
      var secondContent = yield fs.readFile('tmp/index.js');
      assert(!bufferEqual(firstContent, secondContent));
    }));

    it('handles source maps in development', co.wrap(function*() {
      var content = yield fs.readFile('tmp/index.js');
      var sourceMap = convert.fromSource(content.toString());
      var exists = yield sourceMap
            .getProperty('sources')
            .slice(1)
            .filter(identity)
            .map(checkIfExists);
      exists.forEach(assert);
    }));
  });
});

function hasJsFile(log) {
  return log === 'index.js';
}

function hasLibFile(log) {
  return log.includes(path.join('lib', 'index.js'));
}

function hasPaths(log) {
  return log.includes(path.join('test', 'src', 'js')) && log.includes('tmp');
}

function identity(x) {
  return x;
}

function checkIfExists(url) {
  return fs.exists(url.replace(protocol, '').split('/').join(path.sep));
}
