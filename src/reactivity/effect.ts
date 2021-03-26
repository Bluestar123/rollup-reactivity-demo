import { isArray, isInteger } from "./../shared/index";
export function effect(fn, options: any = {}) {
  // 创建成响应式的  不同参数创建不同effect  computed也有关系
  const effect = createReactiveEffect(fn, options);

  // 没有延迟触发，默认先执行函数
  if (!options.lazy) {
    effect();
  }
  return effect;
}
// 用来存储当前effect函数 全局属性
let activeEffect; // 类似Dep.target
let uid = 0;

/**\
 *  effect(() => {
 *    state.name
 *    effect(() => {
 *       state.age
 *    })
 *    state.address  // 防止执行的时候 acctiveEffect 设置为了null ，无法收集
 * })
 */
const effectStack = [];

function createReactiveEffect(fn, options) {
  // 先存起来，
  const effect = function () {
    // 防止死循环 递归执行
    if (!effectStack.includes(activeEffect)) {
      try {
        activeEffect = effect;
        effectStack.push(activeEffect);
        // 函数默认传了就执行 内部会对数据进行取值操作
        return fn(); // 执行会做取值操作，拦截，可以拿到 activeEffect
      } finally {
        effectStack.pop(); // 移除最后一个，从后往前执行
        activeEffect = effectStack[effectStack.length - 1];
        // return 后继续执行 防止在effect外部修改属性 state.a = 153
      }
    }
  };
  // 唯一性
  effect.id = uid++;
  // 表示 effcet 中依赖了哪些属性
  effect.deps = [];
  effect.options = options;
  return effect;
}

// 将属性和eeffect关联一起
// 取值get时触发
// 那个对象中的 key 关联了那个 effect  {obj1: {key: [effect1, effect2]}, obj2: {key: [effect2]}}
const targetMap = new WeakMap(); // {}
export function track(target, key) {
  if (activeEffect == undefined) return;
  // 谢依赖格式
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    // 如果没有effect，把effect放到集合中
    dep.add(activeEffect);
    // push dep不是数组
    activeEffect.deps.push(dep); // 双向记忆结构
  }
  console.log(targetMap, target, key)
}

// 触发更新
/**
 *
 * @param target 修改那个对象
 * @param type 新增还是修改
 * @param key key 值
 * @param value 改成的值
 * @param oldValue 旧值
 */
export function trigger(target, type, key, value?, oldValue?) {
  const depsMap = targetMap.get(target);
  console.log(depsMap, target)
  if (!depsMap) {
    // 没有做依赖收集 不用更新视图
    return;
  }

  const run = (effects) => {
    if (effects) effects.forEach((effect) => effect()); // Set 存的是 activeEffect
  };
  // 数组有特殊情况
  if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key) => {
      // 改的长度 小于数组原有的长度 时，刷新视图
      if (key == 'length' || key >= value) { // state.age = arr[2]  arr.length = 1   2> 1
        // 触发更新
        run(dep)
      }
    })
  } else {
    // 对象的处理
    if (key != void 0) {
      // 修改了key
      run(depsMap.get(key)); // Set
    }

    switch (type) {
      case 'add': // 只对新增有要求
        // 通过索引给数组增加选项
        // arr[10] = 1
        if(isArray(target)) {
          if (isInteger(key)) {
            // 会对数组每一属性都获取，触发length effect
            run(depsMap.get('length'))
          }
        }
        break;
    
      default:
        break;
    }
  }
}
