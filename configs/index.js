'use strict';

var merge = require('merge');
var rump = require('rump');
var webpack = require('./webpack');

exports.rebuild = function() {
  rump.configs.main.globs = merge.recursive({
    build: {
      scripts: '*.js'
    },
    watch: {
      scripts: '**/*.js'
    },
    test: {
      scripts: '**/*_test.js'
    }
  }, rump.configs.main.globs);

  rump.configs.main.paths = merge.recursive({
    source: {
      scripts: 'scripts'
    },
    destination: {
      scripts: 'scripts'
    }
  }, rump.configs.main.paths);

  rump.configs.main.scripts = merge.recursive({
    aliases: {},
    common: false,
    library: false,
    uglify: {
      dropDebugger: true,
      dropConsole: true
    },
    webpack: {}
  }, rump.configs.main.scripts);

  exports.webpack = webpack();
};

exports.rebuild();
