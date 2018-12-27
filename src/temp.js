let args = Array.from(arguments)
let result = null
let isCorresponded = false
let thisObject = this

Each(fn[`__LIZE_PATTERNS_${name}_${currentId}`], (pattern) => {
  let isCoresspond = true
  let computed = {}
  let defualtArgCount = 0

  Each(pattern.args, (arg, argIndex) => {
    if (typeof args[argIndex] === 'undefined') {
      if (arg.hasDefault()) {
        computed[arg.name] = arg.getDefault()
        defualtArgCount++
      } else {
        isCoresspond = false
        return false
      }
    } else {
      if (arg.check(args[argIndex])) {
        computed[arg.name] = args[argIndex]
      }
    }
  })

  if (Object.keys(computed).length < args.length + defualtArgCount) {
    isCoresspond = false
  }

  if (isCoresspond) {
    result = thisObject[`__LIZE_PROCESS_${name}_${pattern.id}`](computed)
    isCorresponded = true
    return false
  }
})

if (isCorresponded === false) {
  throw Error(
    '[Carbine] Undefined function pattern. Passed:' +
      args.map((arg) => typeof arg).join(',')
  )
}

return result || undefined
