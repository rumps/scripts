'use strict';

var rump = module.exports = require('rump');
var configs = require('./configs');
var originalAddGulpTasks = rump.addGulpTasks;

// TODO remove on next major core update
rump.addGulpTasks = function(options) {
  originalAddGulpTasks(options);
  require('./gulp');
  return rump;
};

rump.on('update:main', function() {
  configs.rebuild();
  rump.emit('update:scripts');
});

Object.defineProperty(rump.configs, 'uglifyjs', {
  get: function() {
    return configs.uglifyjs;
  }
});

Object.defineProperty(rump.configs, 'webpack', {
  get: function() {
    return configs.webpack;
  }
});
