/* global describe, it, expect */

import utils from '../src/helpers/utils'

describe('utils', function () {
  it('has a method that merges an object into another', function () {
    expect(utils.merge({}, { foo: 'foo', bar: 'foo' }, { bar: 'bar', baz: 'baz' })).toEqual({ foo: 'foo', bar: 'bar', baz: 'baz' })
  })

  it('has a method that return a random number between min and max', function () {
    for (let i = 0; i < 100; i++) {
      expect(utils.random(0, 10)).toBeWithinRange(0, 10)
    }
  })

  it('has a method that return a random floating number between min and max', function () {
    for (let i = 0; i < 100; i++) {
      expect(utils.randomFloat(0.1, 0.9)).toBeWithinRange(0.1, 0.9)
    }
  })

  it('has a method that returns a percentage between two numbers', function () {
    expect(utils.getPercentageOf(0, 100, 0.1)).toBe(10)
    expect(utils.getPercentageOf(0, 100, 0.5)).toBe(50)
    expect(utils.getPercentageOf(0, 100, 0.87)).toBe(87)
    expect(utils.getPercentageOf(0, 100, 1)).toBe(100)
    expect(utils.getPercentageOf(0, 100, 0)).toBe(0)
  })
})
