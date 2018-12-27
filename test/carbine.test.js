import Carbine from '../src/carbine.js'

const Arg_x_y = {
  x: Number,
  y: Number
}

describe('Print', () => {
  test('Set type declear', () => {
    const Print = Carbine()
    Print.CarbineDefine(Arg_x_y, ({ x, y }) => `x=${x},y=${y}`)
    expect(Print(32, 32)).toBe('x=32,y=32')
  })
  
  test('Object based declear', () => {
    const Print = Carbine()
    Print.CarbineDefine({
      x: {
        type: Number
      },
      y: {
        type: Number
      }
    }, ({ x, y }) => `x=${x},y=${y}`)
    expect(Print(32, 32)).toBe('x=32,y=32')
  })
  
  test('Object based declear with default', () => {
    const Print = Carbine()
    Print.CarbineDefine({
      x: {
        type: Number,
        default: () => 0
      },
      y: {
        type: Number,
        default: () => 0
      }
    }, ({ x, y }) => `x=${x},y=${y}`)

    expect(Print(32, 32)).toBe('x=32,y=32')
    expect(Print()).toBe('x=0,y=0')
  })
  
  test('Array based declear', () => {
    const Print = Carbine()
    Print.CarbineDefine({
      x: [Number],
      y: [Number]
    }, ({ x, y }) => `x=${x},y=${y}`)
    expect(Print(32, 32)).toBe('x=32,y=32')
  })

  test('Overloads', () => {
    const Print = Carbine()
    Print.CarbineDefine({
      x: Number,
      y: Number
    }, ({ x, y }) => `x=${x},y=${y}`)
    Print.CarbineDefine({
      xy: Number
    }, ({ xy }) => `x=${xy},y=${xy}`)

    expect(Print(32, 32)).toBe('x=32,y=32')
    expect(Print(64)).toBe('x=64,y=64')
  })

  test('Zero argument pattern', () => {
    const Print = Carbine()
    Print.CarbineDefine(null, () => 'Zero')

    expect(Print()).toBe('Zero')
  })
})
