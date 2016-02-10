var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
  node: {
    fs: "empty"
  },
  entry: {
    "ui": [
      './browser/src/index.js'
    ],
    "init": [
      './browser/src/init.js'
    ],
  },
  output: {
    filename: './browser/js/nouwiki.[name].js'
  },
  module: {
    //noParse: [/autoit.js/],
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader?sourceMap") },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') }, // use ! to chain loaders
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.json$/, loader: "json" }
    ]
  },
  plugins: [
    new ExtractTextPlugin("./browser/css/nouwiki.[name].css")
  ]
};
