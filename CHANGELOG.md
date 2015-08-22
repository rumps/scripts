# Changelog

#### 0.7.1
- If Babel is available, parse Riot tags with it

### 0.7.0
- Use Babel fully for ES2015+
- Replace JSHint with ESLint
- Add code coverage support
- Update packages
- Rewrite tests with ES2015+ and should.js
- **BREAKING** Drop auto checking for loaders in favor of Babel
  - `6to5-loader`
  - `jsx-loader`
  - `traceur-loader`
- Update `babel-loader`'s runtime option
- Add `riotjs-loader`

#### 0.6.10
- Fix runtime option for Babel

#### 0.6.9
- Fix runtime option for Babel

#### 0.6.8
- Turn off minification for HTML

#### 0.6.7
- Drop/ignore `newWatcher` as Webpack now defauls to it

#### 0.6.6
- Rewrite source maps
- Add extensions to match Babel's defaults (es/es6/jsx)

#### 0.6.5
- Fix detecting `babel-runtime`

#### 0.6.2
- 6to5 is now known as Babel (keep 6to5 autodetect for now)
- Babel - auto self contain if `babel-runtime` is available
- JSX - auto strip Flow annotations
- CoffeeScript - set literate mode in loader for literate files

#### 0.6.1
- Add JSON loader support
- Fix glob missing in JSX

### 0.6.0
- Update to match Rump 0.6.0 (pass options)
- Update `require-all`
- Have test glob check for `_test` suffix

### 0.5.0
- Update to match Rump 0.5.0 (use same minor version)

### 0.4.0
- Update to match Rump 0.4.0 (use `npm dedupe`)

### 0.3.0
- Update to match Rump 0.3.0

#### 0.2.6
- Add option to use Webpack's new watcher

#### 0.2.5
- Add support to auto detect 6to5-loader

#### 0.2.4
- Add default test glob

#### 0.2.3
- Detect some Webpack loaders when building configuration

#### 0.2.2
- Remove unused watch glob

#### 0.2.1
- Add version information to info task
- Add common information to info task

### 0.2.0
- Initial alpha version
