import { isArray, isObject } from "./../shared/index";
import { isString, ShapeFlags } from "../shared/index";

// 创建组件的虚拟节点
export function createVNode(type, props: any = {}, children = null) {
  // type 什么类型 直接1234 不好，还有其他的运算
  // 位移操作
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT // 字符串是元素
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT//对象是组件
    : 0;
  const vnode = {
    // 可以表示dom 结构，虚拟节点。也可以用来表示组件
    type,
    props,
    children,
    component: null, // 组件实例
    el: null, // 虚拟节点和真实节点映射关联
    key: props.key,
    shapeFlag, // vue3 优秀做法 虚拟节点类型，元素，组件
  };

  // 可以通过 shapeFlag 知道 虚拟节点和孩子是什么类型
  if(isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN // 有一是1
  } else {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN // 否则是字符串
  }
  return vnode
}
