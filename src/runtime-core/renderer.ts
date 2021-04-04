// 创建渲染器

import { effect } from "../reactivity/effect"
import { ShapeFlags } from "../shared/shapeFlag"
import { createAppAPI } from "./apiCreateApp"
import { createComponentInstace, setupComponent } from "./component"

// 节点操作
export function createRenderer(options) {
  // 创建渲染功能
  return baseCreateRenderre(options)
}


function baseCreateRenderre(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    setElementText: hostSetElementText,
    insert: hostInsert,
    remove: hostRemove
  } = options

  // 虚拟节点放到容器中
  const render = (vnode, container) => {
    // 需要将虚拟节点 变成真实节点
    // 第一次渲染 无老节点 null 没有老节点  新节点和容器
    patch(null, vnode, container)
  }

  const mountElement = (vnode, container, anchor) => {
    // n2 虚拟节点 container 容器
    let {shapeFlag, props} = vnode
    let el = vnode.el = hostCreateElement(vnode.type)

    // 创建 儿子节点  是文本还是数组
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el)
    }

    if (props) {
      for(let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    hostInsert(el, container, anchor)
  }
  const mountChildren = (children, el) => {
    for (let i = 0; i<children.length;i++) {
      patch(null, children[i], el)
    }
  }

  const patchProps = (oldProps, newProps, el) => {
    // 相同不作处理    相当于两层对象，便利外层， patchProp 遍历内层
    if (oldProps !== newProps) {
      // 新的属性 需要覆盖掉老的属性
      for(let key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (prev !== next) {
          hostPatchProp(el, key, prev, next)
        }
      }
      // 老的有的属性，新的没有，将老的删除
      for(const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }

  const patchKeyChildren = (c1, c2, el) => {
    // el 当前标签那个元素
    // 内部有优化策略
    let i = 0   // 指针
    let e1 = c1.length - 1// 老儿子 children 最后一项索引
    let e2 = c2.length - 1 // 新节点 children 最后一项索引

    // abc
    // abde
    // 正向比较
    while(i <= e1 && i <= e2) { // 有任何一项循环完 就停止
      // 每一项都是个h
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, el) // 自带递归比对子元素
      } else {
        break
      }
      i++
    }

    // 反向比较 i 固定了
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnodeType(n1, n2)) {
      } else {
        patch(n1, n2, el)
        break
      }
      e1--
      e2--
    }

    // 考虑元素新增和删除的操作
    // abc => abcd  (i == 3 e1 = 2 e2 = 3)  abc => dabc (i=0 e1=-1 e2=0)
    // 只要 i > e1 说明 新增属性了
    if (i > e1) {
      // 有新增的部分
      if (i <= e2) {
        // 先根据e2获取塔下一个元素，和数组长度进行比较
        const nextPos = e2 + 1
        // 获取参照物，往前添加还是往后添加
        const anchor = nextPos < c2.length ? c2[nextPos].el : null // 插后面

        while(i <= e2) {
          patch(null, c2[i], el, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 老的比 新的长 删除
      while(i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 无规律情况
      // ab ced fg // i=2 e1=4 e2 = 5
      // ab edch fg
      const s1 = i
      const s2 = i
      // 新的索引和 key 做成映射表 乱序的需要映射查找
      const keyToNewIndexMap = new Map()
      for(let i = s2;i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }
      // 中间不一样的长度
      const toBePatched = e2 - s2 + 1
      const newIndexToOldMapIndex = new Array().fill(0)

      // 遍历老的 看有没有同样的key
      for(let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        // 获取新的索引, 看下新的索引中有没有老的
        let newIndex = keyToNewIndexMap.get(prevChild.key)
        // 老的有   新的没有
        if(newIndex == undefined) {
          // 直接移除
          hostRemove(prevChild.el)
        } else {
          // ab [cde] fg
          // ab [edch] fg // [5]
          // 修改属性
          newIndexToOldMapIndex[newIndex - s2] = i + 1

          patch(prevChild, c2[newIndex], el)
        }
      }

      // 最长递增子序列 优化算法
      let increasingIndexSequence= getSequence(newIndexToOldMapIndex)
      let j = increasingIndexSequence.length - 1


      // 更改顺序   倒叙插入
      // 找到 最后一项 [edch]
      for(let i = toBePatched - 1; i => 0; i++) {
        const nextIndex = s2 + i // 找到了h 索引
        // 找到h元素
        const nextChild = c2[nextIndex]
        // 找到下一个元素
        let anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
        if (newIndexToOldMapIndex[i] == 0) {// 新元素直接创建，插入到当前元素下一个
          patch(null, nextChild, el, anchor)
        } else {
          // 根据参照物 依次将节点直接移动过去
          // 所有节点都要移动，dom操作 没有考虑不动的情况
          // hostInsert(nextChild.el, el, anchor)

          if (j < 0 || i != increasingIndexSequence[j]) {
            // 不动 直接复用
            hostInsert(nextChild.el, el, anchor)
          } else {
            j--
          }
        }
      }
    }
  }
  const getSequence = (map) => { return []}

  // 核心diff 算法
  const patchChildren = (n1, n2, el) => {
    // 获取老的子节点
    const c1 = n1.children
    // 获取新的子节点
    const c2 = n2.children

    const prevShapFlag = n1.shapeFlag // 上一次元素类型
    const shapeFlag = n2.shapeFlag // 当前元素类型
    
    // 老的文本，新的文本  》 直接覆盖
    // 老的 数组，新的文本 》 直接覆盖
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 是文本 文本不同
      if (c2 !== c1) {
        hostSetElementText(el, c2)
      }
    } else {
      // 老的 数组，新的数组 》 diff算法
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 核心的diff 算法需要key
        patchKeyChildren(c1, c2, el)
      } else {
      // 老的文本，新的数组 》 移除老的文本，生成新的节点塞入
        if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
          // 移除文本
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 新的元素挂载, 生成元素塞进去
          for (let i = 0; i < c2.length; i++) {
            // 每一个虚拟节点插入
            patch(null, c2[i], el)
          }
        }
      }
    }
  }

  const patchElement = (n1, n2, container) => {
    // n1 n2类型一样
    let el = n2.el = n1.el // 把老真是元素赋值给当前新的元素，因为类型一样，不用再创建了

    // 比较属性
    const oldProps = n1.props || {}// 类型一样比属性， 再比子元素
    const newProps = n2.props || {}
    patchProps(oldProps, newProps, el)

    // 比较子元素  数组或字符串
    patchChildren(n1, n2, el) // 核心diff 算法
  }

  const mountComponent = (initialVnode, container) => {
    // 组件挂载逻辑
    // 1. 创建组件实例  2. 找到组件的render方法 3. 执行render
    // 组件实例记录当前组件状态
    // 组件实例挂载到虚拟节点上
    const instance = initialVnode.component = createComponentInstace(initialVnode)

    // 获取组件的 setup 函数
    setupComponent(instance)
    // 获取到了render
    // console.log(instance.render)
    // 如果render中数据变化要重新渲染调用 render
    // 给每个组件创建一个effect  == vue2 中的watcher
    setupRenderEffect(instance, initialVnode, container)
  }

  // 数据更新 重新渲染
  const setupRenderEffect = (instance, initialVnode, container) => {
    effect(function componentEffect() {
      if (!instance.isMounted) {
        // 渲染组建中的内容
        const subTree = instance.subTree = instance.render() // 组件对应渲染的结果

        // 渲染子树
        patch(null, subTree, container)
        instance.isMounted = true
      } else {
        // 更新逻辑
        let prev = instance.subTree // 上一次的渲染结果  赋值到自己vnode上了
        let next = instance.render() // 再调一次
        // diff 算法
        patch(prev, next, container)
      }
    })
  }

  const updateComponent = (n1, n2, container) => {

  }

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor)
    } else {
      // 更新元素
      patchElement(n1, n2, container)
    }
  }
  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      mountComponent(n2, container) // 挂在组件
    } else {
      // 更新操作
      updateComponent(n1, n2, container)
    }
  }

  const isSameVnodeType = (n1, n2) => {
    return n1.type == n2.type && n1.key == n2.key
  }

  const patch = (n1, n2, container, anchor = null) => {
    let {shapeFlag} = n2 // 判断元素还是组建  n2新节点

    // 判断标签是否一样，1. 标签名 2. key不一致两个元素
    if(n1 && !isSameVnodeType(n1, n2)) {
      // 删除老节点，老节点虚拟节点上对应真实节点
      hostRemove(n1.el)
      n1 = null// 移除n1 ，设为null，直接渲染n2
    }


    // 20 不是 元素
    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 全1才1
      processElement(n1, n2, container, anchor)
    } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 10100
      // 00100  是组件
      // 00100
      processComponent(n1, n2, container)
    }
  }

  return {
    // 调用createApp 时，应该执行 render渲染
    createApp: createAppAPI(render)
  }
}