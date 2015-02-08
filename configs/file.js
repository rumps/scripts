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

// JS with 6to5
if(moduleExists('6to5-loader')) {
  loaders.push({
    test: /^(?!.*(bower_components|node_modules))+.+\.js$/,
    loaders: ['6to5-loader']
  });
}

// JSX
if(moduleExists('jsx-loader')) {
  extensions.push('.jsx');
  glob.push('jsx');
  loaders.push({
    test: /\.jsx$/,
    loaders: ['jsx-loader?harmony&insertPragma=React.DOM']
  });
}

// CoffeeScript
if(moduleExists('coffee-loader')) {
  extensions.push('.coffee', '.coffee.md', '.litcoffee');
  glob.push('coffee', 'coffee.md', 'litcoffee');
  loaders.push({
    test: /\.(coffee|coffee\.md|litcoffee)$/,
    loaders: ['coffee-loader']
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

function moduleExists(mod) {
  if(~modules.indexOf(mod)) {
    try {
      require.resolve(mod);
      return true;
    }
    catch(e) {}
  }
}
