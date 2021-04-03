import { compile } from '../../node_modules/vue/dist/vue';
import { isFunction } from './../shared/index';
//　根据传入的组件创建实例
export const createComponentInstace = (vnode) => {
  // 创建实例
  const instance = {
    type: vnode.type, // 是那个组件
    props: {},
    vnode,
    render: null, //如果是函数覆盖
    setupState: null, // 如果是对象覆盖
    isMounted: false // 是否挂载初始值
  }
  return instance
}


export const setupComponent = (instance) => {
  // 1. 源码中会对属性初始化
  // 2. 对插槽初始化
  // 3. 调用setup

  setupStatefulComponent(instance)
}

// 方法超过 5 行尽量拆分
function setupStatefulComponent(instance) {
  const Component = instance.type // 组件的虚拟节点

  const {setup} = Component
  if (setup) {
    // 获取setup返回结果  可能是函数， 可能是对象
    const setUpResult = setup()
    handleSetupResult(instance, setUpResult) // 如果是对象，要挂载到实例上
  }
}

function handleSetupResult(instance, setUpResult) {
  // 如果是函数直接渲染
  if (isFunction(setUpResult)) {
    instance.render = setUpResult
  } else {
    instance.setupState = setUpResult
  }

  finishComponnetSetup(instance)
}

function finishComponnetSetup(instance) {
  const Component = instance.type // 组件的虚拟节点
  const {render} = Component
  if (render) {
    instance.render = render // 默认render优先级高于setup返回的render
  } else if (!render) {
    // compile(Component.template) // 编译成 render 函数
  }

  // vue3 兼容 2 的属性  data watch
  // 做个合并
  // applyOptions() vue2 和 vue3 中 setup 返回的结果合并操作，兼容
}