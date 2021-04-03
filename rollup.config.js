// 和ts关联
import ts from 'rollup-plugin-typescript2'
// 解析第三方模块
import {nodeResolve} from '@rollup/plugin-node-resolve'
// 替换 process env 变量
import replace from '@rollup/plugin-replace'
// 启动服务
import serve from 'rollup-plugin-serve'

import path from 'path'

export default {
  input: 'src/index.ts',
  output: {
    name: 'Vue', // vue响应式模块  window.
    format: 'umd',
    file: path.resolve('dist/vue.js'),
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts']
    }),
    ts({
      tsconfig: path.resolve(__dirname, 'tsconfig.json')
    }),
    // 模块里的这种变量， 浏览器中也不存在
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    serve({
      openPage: '/public/index.html',
      port: 3000
    })
  ]
}