function patchClass(el, value) {
  if (value == null) {
    value = ''
  }
  el.className = value
}

function patchStyle(el, prev, next) {
  // {colorL red} {background red}
  const style = el.style;
  if (!next) {
    el.removeAttribute('style') // 不需要有样式
  } else {
    for (let key in next) {
      style[key] = next[key]
    }
    if (prev) {
      // 老的有，新的没有，移除
      for(let key in prev) {
        if(next[key] == null){
          style[key] = ''
        }
      }
    }
  }
}

function patchAttr(el, key, value) {
  if (value == null) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, value)
  }
}

// 属性操作 比对属性
export function patchProp(el, key, preValue, nextValue) {
  switch (key) {
    case 'class':
      patchClass(el, nextValue)
      break;
    case 'style':
      // {color: 'red'}
      patchStyle(el, preValue, nextValue)
      break;
    default:
      patchAttr(el, key, nextValue)
      break;
  }
}