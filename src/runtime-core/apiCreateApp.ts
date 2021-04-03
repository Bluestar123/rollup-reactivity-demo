import { createVNode } from './vnode';
// import {createVNode} from 'vue'

export function createAppAPI(render) {
  return (rootComponent) => {
    // 重写 不涉及dom操作
    const app = {
      mount(container) { // 与平台无关
        // 用户调用的mount 方法

        // 创建虚拟节点
        const vnode = createVNode(rootComponent)
        render(vnode, container)
      }
    }
    return app
  }
}