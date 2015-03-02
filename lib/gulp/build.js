'use strict';

var extend = require('extend');
var gulp = require('gulp');
var util = require('gulp-util');
var rump = require('rump');
var webpack = require('webpack');

gulp.task(rump.taskName('build:scripts'), build);
gulp.tasks[rump.taskName('build')].dep.push(rump.taskName('build:scripts'));
gulp.tasks[rump.taskName('watch')].dep.push(rump.taskName('build:scripts'));

function build(callback) {
  var callbackCalled = false;
  var options = rump.configs.webpack;

  if(rump.configs.watch) {
    options = extend({}, options, {watch: true});
  }

  webpack(options, function(error, stats) {
    if(error) {
      throw new util.PluginError(rump.taskName('build:scripts'), error);
    }
    if(callbackCalled) {
      util.log(stats.toString({
        assets: false,
        chunks: false,
        colors: util.colors.supportsColor,
        hash: false,
        modules: false,
        reasons: false,
        source: false
      }));
    }
    else {
      callbackCalled = true;
      util.log(stats.toString({colors: util.colors.supportsColor}));
      callback();
    }
  });
}
