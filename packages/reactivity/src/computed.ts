import { isFunction } from "@vue/share";

import {
  activeEffect,
  ReactiveEffect,
  trackEffect,
  triggerEffect,
} from "./effect";

class ComputedRefImpl {
  public _value;
  public _dirty = true;
  public effect = undefined;
  public deps = undefined;
  constructor(public getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerEffect(this.deps);
      }
    });
  }

  get value() {
    if (activeEffect) {
      trackEffect(this.deps || (this.deps = new Set()));
    }
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}
export function computed(getterOrOptions) {
  let isGetter = isFunction(getterOrOptions);
  let errorSetter = function () {
    console.error("error");
  };
  let getter, setter;
  if (isGetter) {
    getter = getterOrOptions;
    setter = errorSetter;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set || errorSetter;
  }
  const runner = new ComputedRefImpl(getter, setter);

  return runner;
}
