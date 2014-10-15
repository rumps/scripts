'use strict';

var extend = require('extend');
var rump = require('rump');
var webpack = require('./webpack');

exports.rebuild = function() {
  rump.configs.main.globs = extend(true, {
    build: {
      scripts: '*.js'
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
    minify: rump.configs.main.environment === 'production',
    sourceMap: rump.configs.main.environment === 'development',
    macros: {
      'process.env.NODE_ENV': JSON.stringify(rump.configs.main.environment)
    }
  }, rump.configs.main.scripts);

  exports.uglifyjs = extend(true, {
    output: {
      comments: false
    },
    compress: {
      'drop_console': true,
      'drop_debugger': true
    }
  }, rump.configs.main.scripts.uglifyjs);

  exports.webpack = webpack();
};

exports.rebuild();
