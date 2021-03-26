// 共享方法
export const isObject = (val: unknown) => typeof val === 'object' && val !== null

export const isSymbol = (val: unknown) => typeof val === 'symbol'

export const isArray = Array.isArray

// 是否是数组索引 字符串 arr[10] => arr['10']
export const isInteger = key => parseInt(key, 10) + '' === key

const hasOwnProperty = Object.prototype.hasOwnProperty
// 私有属性
export const hasOwn = (val, key) => hasOwnProperty.call(val, key)

export const hasChanged = (val, oldVal) => val !== oldVal