// 节点操作
export const nodeOps = {
  createElement(type) {
    // 创建
    return document.createElement(type)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  // 把 child 插入到 parent 中 的那个node之前位置， 没有就是最后
  insert(child, parent, anchor = null) {
    parent.insertBefore(child, anchor)
  },
  remove(child) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  }
}