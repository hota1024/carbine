import Utils, { ObjectEach, TypeJudge, Each } from '@/utils'

const Boxol = {
  Marked (data) {
    let result = ''
    let maxLength = 0

    data.forEach((line) => {
      maxLength = Math.max(maxLength, line.length)
    })

    result += '╭' + '─'.repeat(maxLength) + '╮\n'

    data.forEach((line) => {
      let afterPad = ' '.repeat(maxLength - line.length)
      result += '|' + line + afterPad + '|\n'
    })

    result += '╰' + '─'.repeat(maxLength) + '╯\n'

    return result
  },
  Mark (data) {
    console.log(this.Marked(data))
  }
}

class Argument {
  constructor (name, checker, defaultFn = undefined, pType) {
    this.name = name
    this.check = checker
    this.getDefault = defaultFn
    this.type = pType
  }

  hasDefault () {
    return this.getDefault !== undefined
  }

  getTypeName () {
    if (this.type === null) {
      return 'Unknown'
    }

    return this.type.name
  }
}

class Pattern {
  constructor (args, id) {
    this.args = args
    this.id = id
  }
}

function CompileArguments (args) {
  let compiled = []

  ObjectEach(args, (type, name) => {
    let defaultFn
    let pType = null
    let checkers = []

    if (type === null) {
    } else if (TypeJudge(type, Array)) {
      if (type[0] && TypeJudge(type[0], Function)) {
        pType = type[0]
        checkers.push((value) => TypeJudge(value, type[0]))
      }

      if (type[1] && TypeJudge(type[1], Function)) {
        checkers.push((value) => type[1])
      }

      if (type[2] && TypeJudge(type[2], Function)) {
        defaultFn = type[2]
      }
    } else if (TypeJudge(type, Function)) {
      pType = type
      checkers.push((value) => TypeJudge(value, type))
    } else {
      if ('type' in type && TypeJudge(type.type, Function)) {
        pType = type.type
        checkers.push((value) => TypeJudge(value, type.type))
      }

      if ('check' in type && TypeJudge(type.check, Function)) {
        checkers.push(type.check)
      }

      if ('default' in type && TypeJudge(type.default, Function)) {
        defaultFn = type.default
      }
    }

    compiled.push(
      new Argument(
        name,
        (value) => {
          return Each(checkers, (checker) => checker(value))
        },
        defaultFn,
        pType
      )
    )
  })

  return compiled
}

function GetResult (args, patterns, resultFn, hasZeroArgumentPattern) {
  let result = null
  let isCorresponded = false

  Each(patterns, (pattern) => {
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
      result = resultFn(pattern.id, computed)
      isCorresponded = true
      return false
    }
  })

  if (isCorresponded === false) {
    if (args.length === 0 && hasZeroArgumentPattern) {
      return resultFn('ZERO')
    } else {
      throw Error(
        '[Carbine] Undefined function pattern. Passed:' +
          args.map((arg) => typeof arg).join(',')
      )
    }
  }

  return result || undefined
}

function Carbine () {
  let fn = function () {
    let args = Array.from(arguments)
    return GetResult(
      args,
      fn.__LIZE_PATTERNS,
      (id, computed) => fn[`__LIZE_PROCESS_${id}`](computed),
      fn[`__LIZE_PROCESS_ZERO`]
    )
  }

  fn.__LIZE_PATTERNS = []
  fn.__LIZE_ID = 0

  fn.CarbineDefine = function (args, process) {
    this[`__LIZE_PROCESS_ZERO`] = false
    if (!args || Object.keys(args) === 0) {
      this[`__LIZE_PROCESS_ZERO`] = process
    } else {
      let compiled = CompileArguments(args)

      this[`__LIZE_PROCESS_${fn.__LIZE_ID}`] = process
      this.__LIZE_PATTERNS.push(new Pattern(compiled, fn.__LIZE_ID))
    }

    fn.__LIZE_ID++
  }

  return fn
}

class CarbineClass {
  static __LIZE_CHECK_AND_SET () {
    if (typeof this.__LIZE_ID === 'undefined') {
      this.__LIZE_ID = 0
    }
  }

  static DefinePrototype (name, args, process) {
    this.__LIZE_CHECK_AND_SET()
    if (typeof this.prototype[name] === 'undefined') {
      this[`__LIZE_PATTERNS_${name}`] = []
      let fn = this

      this.prototype[name] = function () {
        let args = Array.from(arguments)
        let thisObject = this
        return GetResult(
          args,
          fn[`__LIZE_PATTERNS_${name}`],
          (id, computed) => {
            return thisObject[`__LIZE_PROCESS_${name}_${id}`](computed)
          },
          thisObject[`__LIZE_PROCESS_${name}_ZERO`]
        )
      }
      this.prototype[name].__LIZE_NAME = name
    }

    if (!args || Object.keys(args).length === 0) {
      this.prototype[`__LIZE_PROCESS_${name}_ZERO`] = process
    } else {
      let compiled = CompileArguments(args)

      this.prototype[`__LIZE_PROCESS_${name}_${this.__LIZE_ID}`] = process
      this[`__LIZE_PATTERNS_${name}`].push(
        new Pattern(compiled, this.__LIZE_ID)
      )
    }

    this.__LIZE_ID++
  }

  static DefineStatic (name, args, process) {
    this.__LIZE_CHECK_AND_SET()
    if (typeof this[name] === 'undefined') {
      this[`__LIZE_PATTERNS_${name}`] = []
      let fn = this

      this[name] = function () {
        let args = Array.from(arguments)
        return GetResult(
          args,
          fn[`__LIZE_PATTERNS_${name}`],
          (id, computed) => {
            return fn[`__LIZE_PROCESS_${name}_${id}`](computed)
          },
          fn[`__LIZE_PROCESS_${name}_ZERO`]
        )
      }
      this[name].__LIZE_NAME = name
    }

    if (!args || Object.keys(args).length === 0) {
      this[`__LIZE_PROCESS_${name}_ZERO`] = process
    } else {
      let compiled = CompileArguments(args)

      this[`__LIZE_PROCESS_${name}_${this.__LIZE_ID}`] = process
      this[`__LIZE_PATTERNS_${name}`].push(
        new Pattern(compiled, this.__LIZE_ID)
      )
    }

    this.__LIZE_ID++
  }
}

Carbine.Class = CarbineClass
Carbine.Argument = Argument
Carbine.Pattern = Pattern
Carbine.Utils = Utils
Carbine.Help = Carbine()
Carbine.Help.CarbineDefine(
  {
    carbineFn: {
      type: Function,
      check: (value) => '__LIZE_PATTERNS' in value
    }
  },
  ({ carbineFn }) => {
    const Patterns = carbineFn.__LIZE_PATTERNS
    let outputBuffer = []
    outputBuffer.push(`All Patterns(${Patterns.length})`)
    outputBuffer.push('')

    Patterns.forEach((pattern, index) => {
      outputBuffer.push(`Pattern #${index}`)
      outputBuffer.push(`╰Arguments(${pattern.args.length})`)
      pattern.args.forEach((arg, argIndex) => {
        let defaultInfo = ''
        let prefix = pattern.args.length === argIndex + 1 ? '╰' : '├'

        if (arg.hasDefault()) {
          defaultInfo = ` = ${arg.getDefault()}`
        }

        outputBuffer.push(
          ` ${prefix} ${arg.name}: ${arg.getTypeName()}${defaultInfo}`
        )
      })
    })

    // console.log(outputBuffer.join('\n'))
    Boxol.Mark(outputBuffer.map(buff => ` ${buff} `))
  }
)

if (window) {
  window.Carbine = Carbine
}

export default Carbine
