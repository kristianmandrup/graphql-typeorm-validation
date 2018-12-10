export function validateProperty(
  target: any,
  key: string,
  validateProp: (target: any, key: string, newVal: any) => boolean
) {
  let value = target[key];
  const getter = () => {
    return value;
  };

  const setter = newVal => {
    validateProp(target, key, newVal);
    value = newVal;
  };

  if (delete target[key]) {
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  }
}