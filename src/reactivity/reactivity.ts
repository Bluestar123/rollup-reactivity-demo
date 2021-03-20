import { isObject } from './../shared/index';
import {mutableHandlers} from './baseHandlers'

export function reactivity(target: object) {
  // 将目标变成 响应式对象 proxy
  return createReactiveObject(target, mutableHandlers) // 核心操作室读取文件时做依赖收集，数据变化时重新执行 effect
}

// 映射表，key可以为对象，不占用内存，不存在内存泄漏
const proxyMap = new WeakMap()

function createReactiveObject(target: object, baseHandlers) {
  if (!isObject(target)) {
    return target
  }
  const existProxy = proxyMap.get(target)
  if (existProxy) {
    // 如果有直接返回，缓存
    return existProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  // 把代理结果存起来, 源对象和代理后的结果做一个映射表
  proxyMap.set(target, proxy)
  return proxy
}