'use strict';

var extend = require('extend');
var rump = require('rump');
var webpack = require('./webpack');

exports.rebuild = function() {
  rump.configs.main.globs = extend(true, {
    build: {
      scripts: '*.js'
    },
    watch: {
      scripts: '**/*.js'
    }
  }, rump.configs.main.globs);

  rump.configs.main.paths = extend(true, {
    source: {
      scripts: 'scripts'
    },
    destination: {
      scripts: 'scripts'
    }
  }, rump.configs.main.paths);

  rump.configs.main.scripts = extend(true, {
    macros: {
      'process.env.NODE_ENV': JSON.stringify(rump.configs.main.environment)
    },
    uglify: {
      dropDebugger: true,
      dropConsole: true
    },
  }, rump.configs.main.scripts);

  exports.webpack = webpack();
};

exports.rebuild();
