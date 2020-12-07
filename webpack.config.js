const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const commonConfig = {
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  devtool: 'inline-source-map',
  devServer: {
    hot: true
  },
  node: {
    __dirname: false
  },
  stats: {//FIXED: https://github.com/jantimon/html-webpack-plugin/issues/895
    children: false
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader']
      },
      { test: /\.css$/, use:['style-loader','css-loader','postcss-loader']  },
      { test: /\.less$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /.node$/,
        loader: 'node-loader',
      }
    ]
  }
};

module.exports = [
  Object.assign(
    {
      target: "electron-main",
      entry: { main: "./src/main.js" },
      plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
          template: "./public/index.html",
          filename: "index.html",
          inject: false //FIXED: https://github.com/petehunt/webpack-howto/issues/46#issuecomment-164285430
        })
      ]
    },
    commonConfig
  ),
  Object.assign(
    {
      target: "electron-renderer",
      entry: {
        index: "./src/ui/index.jsx",
        MainWindows: "./src/ui/MainWindows.jsx",
        Clipboard: "./src/util/clipboard/Clipboard.js"
      }
    },
    commonConfig
  )
];