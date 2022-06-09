export let activeEffect = undefined;
export class ReactiveEffect {
  public action = true;
  public parent = undefined;
  public deps = [];
  constructor(public fn, public scheduler?) {}
  run() {
    if (!this.action) {
      return this.fn();
    } else {
      try {
        this.parent = activeEffect;
        activeEffect = this;
        cleanEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = undefined;
      }
    }
  }
  stop() {
    if (this.action) {
      cleanEffect(this);
      this.action = false;
    }
  }
}
function cleanEffect(effect) {
  let deps = effect.deps;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect);
  }
}
export function effect(fn, options: Record<string, any> = {}) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

const tragetMap = new WeakMap();
export function track(target, key) {
  if (activeEffect) {
    let depsMap = tragetMap.get(target);
    if (!depsMap) {
      tragetMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
      depsMap.set(key, (deps = new Set()));
    }
    trackEffect(deps);
    let shouldTrack = !deps.has(activeEffect);
    if (shouldTrack) {
      deps.add(activeEffect);
    }
    activeEffect.deps.push(deps);
  }
}

export function trackEffect(deps) {
  let shouldTrack = !deps.has(activeEffect);
  if (shouldTrack) {
    deps.add(activeEffect);
  }
  activeEffect.deps.push(deps);
}

export function trigger(target, key, value) {
  let depsMap = tragetMap.get(target);
  if (depsMap) {
    let effects = depsMap.get(key);
    triggerEffect(effects);
  }
}

export function triggerEffect(effects) {
  if (effects) {
    effects = new Set(effects);
    effects.forEach((effect) => {
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          effect.scheduler();
        } else {
          effect.run();
        }
      }
    });
  }
}
