var path = require('path')
var argv = require('yargs').argv

module.exports = {
  entry: './src/theaterJS.js',

  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'theater' + (argv.p ? '.min' : '') + '.js',
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
  }
}
