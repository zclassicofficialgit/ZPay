// @flow

// Use @babel/register to transpile ES6 imports in main process
require('@babel/register')({
  extensions: ['.js'],
  cache: false,
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-flow'
  ],
  plugins: [
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import'
  ]
});

require('./electron');