'use strict';

var lib = require('./lib');
var isNumber = require('lodash/lang/isNumber');
var html = require('./lib/html')
var type = require('./tags/type');

console.log(isNumber(lib));
console.log(html);
