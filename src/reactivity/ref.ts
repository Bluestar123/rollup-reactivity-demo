/**
 * 根据定义，ref 应该只有一个公开的属性，即 value，如果使用了 reactive 你可以给这个变量增加新的属性，这其实就破坏了 ref 的设计目的，它应该只用来包装一个内部的 value 而不应该作为一个通用的 reactive 对象；
Vue 3中有一个 isRef 函数，用来判断一个对象是 ref 对象而不是 reactive 对象，这种判断在很多场景都是非常有必要的；
性能方面考虑，Vue 3中的 reactive 做的事情远比第二种实现 ref 的方法多，比如有各种检查。
 */

// import { track, trigger } from "./effect";

// export function ref(raw?) {
//   const r = {
//     get value() {
//       track(r, "value");
//       return raw;
//     },
//     set value(newVal) {
//       if ((raw! = newVal)) {
//         raw = newVal;
//         trigger(r, "set", "value");
//       }
//     },
//   };
//   return r;
// }

import { hasChanged, isObject } from "../shared/index";
import { track, trigger } from "./effect";
import { reactive } from "./reactivity";

export function ref(value) {
    return createRef(value)
}
const convert = (val) => isObject(val) ? reactive(val) : val
class RefImpl {
    public readonly __v_isRef = true;
    private _value
    constructor(private _rawValue) {
        this._value = convert(_rawValue)
    }
    get value() {
        track(this, 'value');
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value =  convert(newVal)
            trigger(this, 'set', 'value');
        }
    }
}
function createRef(rawValue) {
    return new RefImpl(rawValue)
}