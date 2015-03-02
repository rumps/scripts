'use strict';

var globule = require('globule');
var gulp = require('gulp');
var util = require('gulp-util');
var path = require('path');
var rump = require('rump');
var webpack = require('webpack');
var pkg = require('../../package');

gulp.task(rump.taskName('info:scripts'), function() {
  var glob = path.join(rump.configs.main.paths.source.root,
                       rump.configs.main.paths.source.scripts,
                       rump.configs.main.globs.build.scripts);
  var files = globule.find([glob].concat(rump.configs.main.globs.global));
  var source = path.join(rump.configs.main.paths.source.root,
                         rump.configs.main.paths.source.scripts);
  var destination = path.join(rump.configs.main.paths.destination.root,
                              rump.configs.main.paths.destination.scripts);
  var action = 'copied';
  var plugins = rump.configs.webpack.plugins;
  var commonFile = plugins.reduce(function(currentFile, plugin) {
    if(!currentFile && plugin instanceof webpack.optimize.CommonsChunkPlugin) {
      return path.join(rump.configs.main.paths.destination.root,
                       rump.configs.main.paths.destination.scripts,
                       plugin.filenameTemplate);
    }
    else {
      return currentFile;
    }
  }, null);

  if(!files.length) {
    return;
  }

  switch(rump.configs.main.environment) {
    case 'development':
      action = 'copied ' + util.colors.yellow('with source maps');
      break;
    case 'production':
      action = util.colors.yellow('minified') + ' and copied';
      break;
  }

  console.log();
  console.log(util.colors.magenta('--- Scripts', 'v' + pkg.version));
  console.log('Processed scripts from', util.colors.green(source),
              'are', action,
              'to', util.colors.green(destination));

  if(rump.configs.main.scripts.common && commonFile) {
    console.log('Common modules across processed scripts are built into',
                util.colors.green(commonFile));
  }

  console.log('Affected files:');
  files.forEach(function(file) {
    console.log(util.colors.blue(path.relative(source, file)));
  });

  console.log();
});

gulp.tasks[rump.taskName('info')].dep.push(rump.taskName('info:scripts'));