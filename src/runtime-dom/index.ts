import {createRenderer} from '../runtime-core/index'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
const renderOptions = {...nodeOps, patchProp} // dom 操作 浏览器平台 增删改查

function ensureRenderer() {
  // 返回一个渲染器 核心模块里
  return createRenderer(renderOptions)
}

export function createApp(rootComponent) {
  // 1. 根据组件创建一个渲染器
  const app = ensureRenderer().createApp(rootComponent)
  // 核心 共用
  const {mount} = app
  // 重写
  app.mount = function(container) {
    container = document.querySelector(container)
    // 1.挂载时先清空容器，在进行挂载
    container.innerHTML = ''
    mount(container)
  }
  return app
}