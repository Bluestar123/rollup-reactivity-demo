import { effect, track, trigger } from './effect';
import { isFunction } from '../shared/index';
class ComputedRefImpl {
    private _value;
    private _dirty = true;
    public readonly effect;
    public readonly __v_isRef = true;
    constructor(getter, private readonly _setter) {
        this.effect = effect(getter, {
            lazy: true,
            scheduler: () => {
                if (!this._dirty) { // 依赖属性变化时
                    this._dirty = true; // 标记为脏值，触发视图更新
                    trigger(this, 'set', 'value');
                }
            }
        })
    }
    get value() {
        if (this._dirty) {
            // 取值时执行effect
            this._value = this.effect();
            this._dirty = false;
        }
        track(this, 'value'); // 进行属性依赖收集
        return this._value
    }
    set value(newValue) {
        this._setter(newValue);
    }
}
export function computed(getterOrOptions) {
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions;
        setter = () => {}
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter)
}