const { defineConfig } = require('@vue/cli-service')
// 引入插件
const NodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin')
// 引入 vant
const { VantResolver } = require('unplugin-vue-components/resolvers')
const ComponentsPlugin = require('unplugin-vue-components/webpack').default

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new NodePolyfillWebpackPlugin, // 注册插件
      ComponentsPlugin({ // 注册 vant
        resolvers: [VantResolver()]
      })
    ]
  }
})
