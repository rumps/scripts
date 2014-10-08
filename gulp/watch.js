'use strict';

var gulp = require('gulp');

gulp.tasks['rump:watch'].dep.push('rump:build:scripts');
