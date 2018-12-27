const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/carbine.js', // Entry file
  output: {
    filename: 'carbine.js', // Filename after build
    path: path.join(__dirname, 'dist/'),
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, './src/')
    }
  }
}
