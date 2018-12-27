export function Each (array, fn) {
  for (let i = 0; i < array.length; ++i) {
    if (fn(array[i], i) === false) {
      return false
    }
  }

  return true
}

export function ObjectEach (object, fn) {
  return Each(Object.keys(object), (key) => {
    return fn(object[key], key)
  })
}

export function TypeJudge (target, type) {
  if (typeof target === 'undefined' || target === null) {
    return false
  }

  return target.constructor === type
}

export default {
  Each,
  ObjectEach,
  TypeJudge
}
