var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
  node: {
    fs: "empty"
  },
  entry: {
    "./browser/js/nouwiki.init.min": './browser/src/init.js',
    "./parser-0.0.1.min": './parser.js'
  },
  output: {
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader?sourceMap") },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.json$/, loader: "json" }
    ]
  },
  plugins: [
    new ExtractTextPlugin("./browser/css/nouwiki.[name].css")
  ]
};
