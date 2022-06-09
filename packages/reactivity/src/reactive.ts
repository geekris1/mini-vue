import { isObject } from "@vue/share";
import { baseHandlers, ReactiveFlags } from "./baseHandlers";

const weakMap = new WeakMap();
export function reactive(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target[ReactiveFlags.IsReactive]) {
    return target;
  }
  let proxy = new Proxy(target, baseHandlers);
  weakMap.set(target, proxy);

  return proxy;
}
