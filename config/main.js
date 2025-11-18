// @flow

// Use @babel/register to transpile ES6 imports in main process
require('@babel/register')({
  extensions: ['.js'],
  cache: false,
});

require('./electron');