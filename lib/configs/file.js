'use strict';

var path = require('path');
var pkg = require(path.resolve('package'));
var modules = [].concat(Object.keys(pkg.dependencies || {}),
                        Object.keys(pkg.devDependencies || {}),
                        Object.keys(pkg.peerDependencies || {}));
var extensions = exports.extensions = ['.js'];
var glob = ['js'];
var loaders = exports.loaders = [];
var aliases = exports.aliases = {};

// JSON
if(moduleExists('json-loader')) {
  loaders.push({
    test: /\.json$/,
    loaders: ['json-loader']
  });
}

// JS with Traceur
if(moduleExists('traceur-loader')) {
  loaders.push({
    test: /^(?!.*(bower_components|node_modules))+.+\.js$/,
    loaders: ['traceur-loader?experimental']
  });
  aliases['traceur-runtime'] = require('traceur-loader').runtime;
}

// JS with Babel (auto self contain if Babel runtime is available)
if(moduleExists('babel-loader')) {
  loaders.push({
    test: /^(?!.*(bower_components|node_modules))+.+\.js$/,
    loaders: ['babel-loader']
  });
  if(moduleExists('babel-runtime', 'babel-runtime/helpers')) {
    loaders[loaders.length - 1].loaders[0] += '?optional=selfContained';
  }
}

// Support for Babel's older name 6to5
if(moduleExists('6to5-loader')) {
  loaders.push({
    test: /^(?!.*(bower_components|node_modules))+.+\.js$/,
    loaders: ['6to5-loader']
  });
  if(moduleExists('6to5-runtime', '6to5-runtime/helpers')) {
    loaders[loaders.length - 1].loaders[0] += '?optional=selfContained';
  }
}

// JSX
if(moduleExists('jsx-loader')) {
  extensions.push('.jsx');
  glob.push('jsx');
  loaders.push({
    test: /\.jsx$/,
    loaders: ['jsx-loader?harmony&stripTypes&insertPragma=React.DOM']
  });
}

// CoffeeScript
if(moduleExists('coffee-loader')) {
  extensions.push('.coffee', '.coffee.md', '.litcoffee');
  glob.push('coffee', 'coffee.md', 'litcoffee');
  loaders.push({
    test: /\.coffee$/,
    loaders: ['coffee-loader']
  });
  loaders.push({
    test: /\.(coffee\.md|litcoffee)$/,
    loaders: ['coffee-loader?literate']
  });
}

// HTML
if(moduleExists('html-loader')) {
  extensions.push('.html');
  loaders.push({
    test: /\.html$/,
    loaders: ['html-loader']
  });
}

// Build glob
if(glob.length > 1) {
  exports.glob = '*.{' + glob.join(',') + '}';
}
else if(glob.length === 1) {
  exports.glob = '*.' + glob[0];
}

function moduleExists(mod, path) {
  path = path || mod;
  if(~modules.indexOf(mod)) {
    try {
      require.resolve(path);
      return true;
    }
    catch(e) {}
  }
}
