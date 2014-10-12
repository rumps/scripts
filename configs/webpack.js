'use strict';

var extend = require('extend');
var globule = require('globule');
var path = require('path');
var rump = require('rump');
var webpack = require('webpack');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var DedupePlugin = webpack.DedupePlugin;
var DefinePlugin = webpack.DefinePlugin;
var DescPlugin = webpack.ResolverPlugin.DirectoryDescriptionFilePlugin;
var ResolverPlugin = webpack.ResolverPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var OccurrenceOrderPlugin = webpack.optimize.OccurrenceOrderPlugin;

module.exports = function() {
  var commonsChunk = 'common';
  var commonsFile;
  var sourceDir = path.join(rump.configs.main.paths.source.root,
                            rump.configs.main.paths.source.scripts);
  var destination = path.join(rump.configs.main.paths.destination.root,
                              rump.configs.main.paths.destination.scripts);
  var options = {
    entry: entries(),
    module: {
      loaders: rump.configs.main.scripts.loaders
    },
    output: {
      path: destination,
      filename: '[name].js'
    },
    plugins: [
      new ResolverPlugin(new DescPlugin('bower.json', ['main'])),
      new DefinePlugin(rump.configs.main.scripts.macros)
    ],
    resolve: {
      alias: rump.configs.main.scripts.aliases,
      modulesDirectories: ['node_modules', 'bower_components'],
      root: path.resolve(sourceDir)
    },
    watchDelay: 200
  };

  if(rump.configs.main.scripts.sourceMap) {
    options.debug = true;
    options.devtool = 'inline-source-map';
    options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';
  }

  if(rump.configs.main.scripts.minify) {
    options.plugins = options.plugins || [];
    options.plugins.push(new UglifyJsPlugin(rump.configs.uglifyjs));
    options.plugins.push(new OccurrenceOrderPlugin());
    options.plugins.push(new DedupePlugin());
  }

  if(rump.configs.main.scripts.common) {
    if(typeof rump.configs.main.scripts.common === 'string') {
      commonsChunk = rump.configs.main.scripts.common;
    }
    commonsFile = commonsChunk + '.js';
    options.plugins = options.plugins || [];
    options.plugins.push(new CommonsChunkPlugin(commonsChunk, commonsFile));
  }

  if(rump.configs.main.scripts.library) {
    options.output.libraryTarget = 'umd';
  }

  return extend(true, options, rump.configs.main.scripts.webpack);
};

function entries() {
  var source = path.join(rump.configs.main.paths.source.root,
                         rump.configs.main.paths.source.scripts,
                         rump.configs.main.globs.build.scripts);

  return globule
  .find([source].concat(rump.configs.main.globs.global))
  .map(function(filename) {
    return path.basename(filename);
  })
  .reduce(function(obj, filename) {
    obj[path.basename(filename, path.extname(filename))] = filename;
    return obj;
  }, {});
}
