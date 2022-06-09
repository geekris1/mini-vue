import { track, trigger } from "./effect";

export const enum ReactiveFlags {
  IsReactive = "_vue_isReactive",
}

export const baseHandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IsReactive) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    let result = true;
    if (target[key] !== value) {
      result = Reflect.set(target, key, value, receiver);
      trigger(target, key, value);
    }
    return result;
  },
};
