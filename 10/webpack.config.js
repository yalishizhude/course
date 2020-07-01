const HtmlWebpackPlugin = require('html-webpack-plugin'); // 通过 npm 安装

module.exports = {
  mode: 'development', // 模式，表示dev环境
  entry: './index.js', // 入口文件
  plugins: [], // 插件
  output: {
    filename: 'bundle.js', // 打包后文件名称
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}