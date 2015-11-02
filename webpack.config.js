var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: './src/theaterJS.js',

  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'theater.min.js',
    library: 'theaterJS',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader']
      },

      {
        test: /\.json$/,
        loaders: ['json-loader']
      }
    ]
  },

  devtool: '#source-map',

  plugins: [new webpack.optimize.UglifyJsPlugin()]
}
