/* global describe, it, expect */

import type from '../src/helpers/type'

let candidates

describe('type utils', function () {
  it('has a method that checks if value is a number', function () {
    candidates = [0, -1, 0.8, 123.23, 4, Infinity, -Infinity]
    candidates.forEach(function (n) { expect(type.isNumber(n)).toBe(true) })

    candidates = [null, '', '0', '-1', '1', 'azerty', function () {}, {}, []]
    candidates.forEach(function (n) { expect(type.isNumber(n)).toBe(false) })
  })

  it('has a method that checks if value is a string', function () {
    candidates = ['', 'azerty', '2']
    candidates.forEach(function (s) { expect(type.isString(s)).toBe(true) })

    candidates = [0, 2, -1, null, [], {}, function () {}]
    candidates.forEach(function (s) { expect(type.isString(s)).toBe(false) })
  })

  it('has a method that checks if value is an object', function () {
    candidates = [{}, { foo: 'bar' }]
    candidates.forEach(function (o) { expect(type.isObject(o)).toBe(true) })

    candidates = [null, [], 0, 3, -1, '', 'foo', function () {}]
    candidates.forEach(function (o) { expect(type.isObject(o)).toBe(false) })
  })

  it('has a method that checks if value is an array', function () {
    candidates = [[], ['foo'], [{ foo: 'bar' }]]
    candidates.forEach(function (a) { expect(type.isArray(a)).toBe(true) })

    candidates = [null, 0, -2, 9, '', 'bar', function () {}]
    candidates.forEach(function (a) { expect(type.isArray(a)).toBe(false) })
  })

  it('has a method that checks if value is a function', function () {
    candidates = [ function () {} ]
    candidates.forEach(function (f) { expect(type.isFunction(f)).toBe(true) })

    candidates = [null, '', [], {}, 0, -3, 9, 'bar']
    candidates.forEach(function (f) { expect(type.isFunction(f)).toBe(false) })
  })
})
