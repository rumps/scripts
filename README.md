# Rump Scripts
[![NPM](http://img.shields.io/npm/v/rump-scripts.svg?style=flat-square)](https://www.npmjs.org/package/rump-scripts)
![License](http://img.shields.io/npm/l/rump-scripts.svg?style=flat-square)
[![Dependencies](http://img.shields.io/david/rumps/rump-scripts.svg?style=flat-square)](https://david-dm.org/rumps/rump-scripts)


## About
Rump Scripts is a Rump module for handling and building scripts with
[Webpack](https://webpack.github.io/), offering a lot of flexibility and
configuration to author your scripts. For more information, visit the
[Rump repository](https://github.com/rumps/rump).


## API
The following is appended to the core Rump API:

### `rump.addGulpTasks(options)`
This module adds the following tasks:

- `build:scripts` will process and build scripts with Webpack. For more
information on source and destination paths see `rump.configure()` below. This
task is also added to the `build` task for single builds as well as the `watch`
task for continuous builds.
- `info:scripts` will display information on what this specific module does,
specifically the source and destination paths as well as what files would get
processed. This task is also added to the `info` task.

### `rump.configure(options)`
Redefine options for Rump and Rump modules to follow. In addition to what
options Rump and other Rump modules offer, the following options are
available alongside default values:

#### `options.paths.source.scripts` (`'scripts'`)
This is the directory where scripts to be processed are contained. This path is
relative to the root source path. (If the default root and scripts path is
used, then the path would be `src/scripts`)

#### `options.paths.destination.scripts` (`'scripts'`)
This is the directory where processed scripts are copied to. This path is
relative to the root destination path. (If the default root and scripts path is
used, then the path would be `dist/scripts`)

#### `options.globs.build.scripts` (`'*.js'` minumum)
This specifies which scripts to process. By default it at least processes all
JS files in the top level directory of the root source path for scripts. See
the Loaders section below for information on any other extensions are set.

#### `options.scripts.minify` (`options.environment === 'production'`)
This specifies whether to minify and uglify generated JS. (minified if `true`)
By default JS is minified only if the environment is set to production. (visit
the main Rump repository for more information on environment)

#### `options.scripts.sourceMap` (`options.environment === 'development'`)
This specifies whether to include inline source maps to generated JS. (source
maps included if `true`) By default source maps are included only if the
environment is set to development. (visit the main Rump repository for more
information on environment)

#### `options.scripts.macros` (`{'process.env.NODE_ENV': JSON.stringify(options.environment)}`)
This specifies identifiers that get injected into scripts as it is getting
processed. By default the only value injected is `process.env.NODE_ENV` as a
convenience to only run code in certain environments. Pass in key-value pairs
to define more macros. In fact, this is a convenience for Webpack's
[`DefinePlugin`](https://webpack.github.io/docs/list-of-plugins.html#defineplugin).

#### `options.scripts.aliases`
This specifies module names to redefine in scripts as it is getting processed.
Pass in an object with key-value pairs to redefine module names. In fact, this
is a convenience for Webpack's
[`resolve.alias`](https://webpack.github.io/docs/configuration.html#resolve-alias)
option. See the Loaders section below for information on any aliases already
set.

#### `options.scripts.common`
This specifies whether to gather common modules that are shared across multiple
generated scripts and place them in a new JS file or add it to an existing JS
file. If value is set to `true`, then either a new `common.js` file is created
or is appended to an existing `common.js` file. If value is a string instead,
then that is the name used instead, whether creating a new file or using an
existing one. (an example is specifying the value `'shared'` will result in a
`shared.js` file) In fact, this is a convenience for Webpack's
[`CommonsChunk`](https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin).

#### `options.scripts.library`
This specifies whether to expose exported modules for scripts at the top level
source directory using UMD. If value is set to `true`, then exports are
exposed.

#### `options.scripts.loaders`
This specifies Webpack loaders to apply to scripts. This is useful for when you
want to add support for things like other languages. Pass in an array of
objects to specify which loaders to apply. In fact, this is a convenience for
Webpack's
[`module.loaders`](https://webpack.github.io/docs/configuration.html#module-loaders).
Read more about using Webpack loaders
[here](https://webpack.github.io/docs/using-loaders.html). See the Loaders
section below for information on any loaders already set.

#### `options.scripts.newWatcher`
This specifies whether to use Webpack's new watching solution. This is helpful
if you are experiencing issues with watching for file updates with scripts. If
value is set to `true`, then the new watching plugin is included.

#### `options.scripts.webpack`
This specifies any options you want to override in Webpack. This is best if you
want to fully make changes in
[Webpack's configuration](https://webpack.github.io/docs/configuration.html).

#### `options.scripts.uglifyjs`
This specifies options that are sent to UglifyJS through Webpack when
minifying. The default options set are:

```js
{
  output: {
    comments: false
  },
  compress: {
    drop_console: true,
    drop_debugger: true
  }
}
```

### `rump.configs.webpack`, `rump.configs.uglifyjs`
This contains the generated options that are passed to Webpack and UglifyJS,
(from Webpack) respectively, in the Gulp task. This is a good way to see what
options are generated based on defaults and overrides.


## Loaders
Rump Scripts will detect loaders available in the project and append items as
needed:

- [`json-loader`](https://github.com/webpack/json-loader) will add support for
  JSON files.
- [`coffee-loader`](https://github.com/webpack/coffee-loader) will add support
  for CoffeeScript files. (`.coffee`, `.coffee.md`, and `.litcoffee`)
- [`html-loader`](https://github.com/webpack/html-loader) will add support to
  expose HTML files as a string.
- [`jsx-loader`](https://github.com/petehunt/jsx-loader) will add support for
  JS files with JSX, typically for use with
  [React](http://facebook.github.io/react/docs/jsx-in-depth.html). (`.jsx`)
  Pragma for React is automatically included and support for Harmony is
  available.
- [`traceur-loader`](https://github.com/jupl/traceur-loader) will add support
  for future JS features today to JS files using
  [Traceur](https://github.com/google/traceur-compiler). (`.js` except from
  `node_modules` and `bower_components`) The traceur runtime is exposed and can
  be accessed via the `traceur-runtime` module alias. (ex:
  `import 'traceur-runtime'` or `require('traceur-runtime')`)
- [`6to5-loader`](https://github.com/Couto/6to5-loader) will add support for
  converting ES6 code to ES5 using [6to5](https://github.com/sebmck/6to5).
  (`.js` except from `node_modules` and `bower_components`)

Want support for another loader? Open an issue/PR.
