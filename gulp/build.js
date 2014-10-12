'use strict';

var extend = require('extend');
var gulp = require('gulp');
var rump = require('rump');
var util = require('gulp-util');
var webpack = require('webpack');

gulp.task('rump:build:scripts', function(callback) {
  var callbackCalled = false;
  var options = rump.configs.webpack;

  if(rump.configs.watch) {
    options = extend({}, options, {watch: true});
  }

  webpack(options, function(error, stats) {
    if(error) {
      throw new util.PluginError('rump:build:scripts', error);
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
});

gulp.tasks['rump:build'].dep.push('rump:build:scripts');
gulp.tasks['rump:watch'].dep.push('rump:build:scripts');