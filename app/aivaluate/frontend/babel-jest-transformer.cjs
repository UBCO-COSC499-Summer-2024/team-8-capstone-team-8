const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['istanbul'],
  babelrc: false,
  configFile: false,
});
