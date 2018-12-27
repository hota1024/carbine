import Carbine from '@/carbine'

class Vec2 extends Carbine.Class {
  constructor () {
    super()
    this.x = 0
    this.y = 0
    this.set(...arguments)
  }
}

Vec2.DefinePrototype('set', null, function () {
  this.set(0)
})

Vec2.DefinePrototype('set', {
  x: Number,
  y: Number
}, function ({ x, y }) {
  this.x = x
  this.y = y
})

Vec2.DefinePrototype('set', {
  xy: Number
}, function ({ xy }) {
  this.x = xy
  this.y = xy
})

Vec2.DefineStatic('Zero', null, () => new Vec2(0))

describe('Vec2', () => {
  test('set', () => {
    let pos1 = new Vec2()
    pos1.set(2, 42)

    expect(pos1.x).toBe(2)
    expect(pos1.y).toBe(42)
  })

  test('Zero', () => {
    let zero = Vec2.Zero()

    expect(zero.x).toBe(0)
    expect(zero.y).toBe(0)
  })
})
