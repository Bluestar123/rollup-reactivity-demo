import { effect, track, trigger } from "./effect"
import {ref} from './ref'

export function computed(getter) {
  const result = ref()
  effect(() => {
    result.value = getter()
  })
  track(result, "value")
  return result

}