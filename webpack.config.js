const webpack = require('webpack');

const isDev = process.env.NODE_ENV !== 'production';

const devPlugins = [
  new webpack.HotModuleReplacementPlugin()
];

const prodPlugins = [
  new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  new webpack.optimize.DedupePlugin()
];

const devPresets = ['react', 'es2015', 'react-hmre'];
const prodPresets = ['react', 'es2015'];

module.exports = {
  devtool: isDev ? 'inline-sourcemap' : false,
  entry: "./index.js",
  devServer: {
    headers: {
      'Access-Control-Allow-Origin' : '*'
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: isDev ? devPresets : prodPresets,
          plugins: [
            'transform-object-assign',
            'transform-object-rest-spread'
          ]
        }
      }
    ]
  },
  output: {
    path: __dirname,
    publicPath: '/',
    filename: "index.min.js"
  },
  plugins: isDev ? devPlugins : prodPlugins
};
