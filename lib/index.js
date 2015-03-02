'use strict';

var fs = require('fs');
var path = require('path');
var rump = module.exports = require('rump');
var ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
var configs = require('./configs');
var originalAddGulpTasks = rump.addGulpTasks;
var protocol = process.platform === 'win32' ? 'file:///' : 'file://';

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

// Rewrite source map URL for consistency
ModuleFilenameHelpers.createFilename = function(module) {
  var url;
  if(typeof module === 'string') {
    url = module.split('!').pop();
  }
  else {
    url = module.resourcePath || module.identifier().split('!').pop();
  }
  if(fs.existsSync(url)) {
    url = protocol + url.split(path.sep).join('/');
  }
  else {
    return '';
  }
  return url;
};

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
