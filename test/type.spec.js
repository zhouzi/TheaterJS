/* global describe, it, expect */

import type from '../src/helpers/type'

let candidates

describe('type utils', function () {
  it('has a method that checks if value is a number', () => {
    candidates = [0, -1, 0.8, 123.23, 4, Infinity, -Infinity]
    candidates.forEach(function (n) { expect(type.isNumber(n)).toBe(true) })

    candidates = [null, '', '0', '-1', '1', 'azerty', function () {}, {}, []]
    candidates.forEach(function (n) { expect(type.isNumber(n)).toBe(false) })
  })

  it('has a method that checks if value is a string', () => {
    candidates = ['', 'azerty', '2']
    candidates.forEach(function (s) { expect(type.isString(s)).toBe(true) })

    candidates = [0, 2, -1, null, [], {}, function () {}]
    candidates.forEach(function (s) { expect(type.isString(s)).toBe(false) })
  })
})
