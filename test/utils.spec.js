/* global describe, it, expect */

import utils from '../src/helpers/utils'

describe('utils', function () {
  it('has a method that merges an object into another', function () {
    expect(utils.merge({}, { foo: 'foo', bar: 'foo' }, { bar: 'bar', baz: 'baz' })).toEqual({ foo: 'foo', bar: 'bar', baz: 'baz' })
  })

  it('has a method that return a random number between min and max', function () {
    expect(utils.random(1, 1)).toBe(1)
    expect(utils.random(0, 0)).toBe(0)

    for (let i = 0; i < 100; i++) {
      expect(utils.random(237, 478)).toBeWithinRange(237, 478)
    }
  })

  it('has a method that return a random floating number between min and max', function () {
    for (let i = 0; i < 100; i++) {
      expect(utils.randomFloat(0.1, 0.9)).toBeWithinRange(0.1, 0.9)
    }
  })

  it('has a method that returns a percentage between two numbers', function () {
    expect(utils.getPercentageOf(250, 700, 0.1)).toBe(295)
    expect(utils.getPercentageOf(120, 450, 0.5)).toBe(285)
    expect(utils.getPercentageOf(80, 90, 0.8)).toBe(88)
    expect(utils.getPercentageOf(220, 400, 1)).toBe(400)
    expect(utils.getPercentageOf(150, 1500, 0)).toBe(150)
  })
})
