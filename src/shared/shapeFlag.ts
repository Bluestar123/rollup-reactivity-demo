// 标识
export const enum ShapeFlags {
  ELEMENT = 1,
  FIMCTOPMA_COMPONENT = 1 << 1, // 二进制 唯一， * 2
  STATEFUL_COMPONENT = 1 << 2, // 组件  是否有状态
  TEXT_CHILDREN = 1 << 3, // 文本节点
  ARRAY_CHILDREN = 1 << 4
}