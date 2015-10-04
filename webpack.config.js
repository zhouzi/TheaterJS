var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: './src/TheaterJS.js',

  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'theater.min.js',
    library: 'TheaterJS',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader']
      }
    ]
  },

  plugins: [new webpack.optimize.UglifyJsPlugin()]
}
