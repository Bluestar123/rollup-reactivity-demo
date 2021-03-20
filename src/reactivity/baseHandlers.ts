import { reactive } from '../../node_modules/@vue/reactivity/dist/reactivity';
import { isSymbol, isObject, isArray, isInteger } from './../shared/index';
// 方法单独提出，可以传参
// 工厂函数，传入不同参数，返回不同产品
function createGetter() {
  return function get(target, key, receiver) {
    // proxy 和 reflect 连用
    const res = Reflect.get(target, key, receiver)
    // 如果取值为 symbol 类型，忽略
    // 数组中有很多symbol内置方法
    if (isSymbol(key)) return key


    // 依赖收集
    console.log('数据进行了获取')
    if (isObject(res)) { // 取值是对象继续代理
      return reactive(res)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value, receiver) {
    // 判断属性是新增还是修改的
    const oldVal = target[key] // 如果是修改 肯定有旧值， 新增的话 是undefined
    // 有没有这个属性
    // 第一种数组新增的逻辑， 第二种是对象的逻辑
    const hadKey = isArray(target) && isInteger(key) ? Number(key) < target.length : 

    // 有返回值
    const result = Reflect.set(target, key, value, receiver)
    
    if (!hadKey) {
      console.log('新增属性')
    } else if (oldVal !== value) {
      console.log('修改属性')
    }


    return result
  }
}

const get = createGetter() // 为了抑制参数
const set = createSetter()

export const mutableHandlers = {
  get,// 获取对象的属性会执行此方法
  set,// 设置属性值会执行
}