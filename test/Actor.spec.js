/* global describe, it, expect, jasmine, beforeEach, spyOn */

import Actor from '../src/Actor'

describe('Actor Class', function () {
  beforeEach(function () {
    spyOn(document, 'querySelector').and.returnValue({})
  })

  describe('instantiation', function () {
    let actor

    it('is able to build some default props', function () {
      actor = new Actor('vader')
      expect(actor.speed).toBe(0.6)
      expect(actor.accuracy).toBe(0.6)
    })

    it('merges options with the defaults', function () {
      actor = new Actor('vader', { accuracy: 0.2 })
      expect(actor.speed).toBe(0.6)
      expect(actor.accuracy).toBe(0.2)
    })

    it('accepts a number to build its props', function () {
      actor = new Actor('vader', 0.8)
      expect(actor.speed).toBe(0.8)
      expect(actor.accuracy).toBe(0.8)
    })
  })

  describe('has a displayValue property', function () {
    it('that calls a callback when it\'s changed', function () {
      let spy = jasmine.createSpy('displayValue callback')
      let actor = new Actor('vader', 0.8, spy)

      actor.displayValue = 'Hey!'

      expect(actor.displayValue).toBe('Hey!')
      expect(spy).toHaveBeenCalledWith('Hey!')
    })
  })

  describe('has a shouldBeMistaken method that', function () {
    it('cannot return true if an actor\'s accuracy is greater or equal to 0.8', function () {
      let actor = new Actor('vader', { accuracy: 0.8 })

      for (let i = 0; i < 100; i++) {
        expect(actor.shouldBeMistaken('aaaaa', 'aaaaaaaaaa')).toBe(false)
      }
    })

    it('randomly returns true or false when actor\'s accuracy is below 0.8', function () {
      let actor = new Actor('vader', { accuracy: 0.3 })
      let results = {}

      for (let i = 0; i < 100; i++) {
        let returnValue = actor.shouldBeMistaken('aaaa', 'aaaaaaaaaa')
        if (results[returnValue] == null) {
          results[returnValue] = 0
        }

        results[returnValue]++
      }

      expect(Object.keys(results).length).toBe(2)
      expect(Object.keys(results)).toContain('true')
      expect(Object.keys(results)).toContain('false')

      expect(results['true']).toBeGreaterThan(0)
      expect(results['false']).toBeGreaterThan(0)
    })

    it('return false when actual value\'s length is <= actor\'s accuracy', function () {
      let actor = new Actor('vader', { accuracy: 0.3 })

      for (let i = 0; i < 10; i++) {
        expect(actor.shouldBeMistaken('a', 'aaaaaaaaaa')).toBe(false)
        expect(actor.shouldBeMistaken('aa', 'aaaaaaaaaa')).toBe(false)
        expect(actor.shouldBeMistaken('aaa', 'aaaaaaaaaa')).toBe(false)
      }
    })

    it('return false if actual value\'s length is equal to the supposed end value', function () {
      let actor = new Actor('vader')

      for (let i = 0; i < 100; i++) {
        expect(actor.shouldBeMistaken('azeqwe', 'azerty')).toBe(false)
      }
    })

    it('based on actor\'s accuracy, cannot return true if actor made a mistake in the previous x characters', function () {
      let actor = new Actor('vader', { accuracy: 0.4 })

      for (let i = 0; i < 100; i++) {
        expect(actor.shouldBeMistaken('awwww', 'azertyuiop', 1)).toBe(false)
      }
    })

    it('return false if actor just fixed a mistake', function () {
      let actor = new Actor('vader', { accuracy: 0 })
      let i

      for (i = 0; i < 100; i++) {
        expect(actor.shouldBeMistaken('hello th', 'hello there!', null, 4)).toBe(false)
      }

      for (i = 0; i < 100; i++) {
        if (actor.shouldBeMistaken('hello th', 'hello there!', null, 2) === true) {
          break
        }
      }

      expect(i).toBeLessThan(100)
    })
  })

  describe('has a getTypingSpeed method that', function () {
    it('return a random value depending on its characteristics', function () {
      let actor = new Actor('vader', { speed: 1 })
      expect(actor.getTypingSpeed(50, 200)).toBe(50)

      actor = new Actor('vader', { speed: 0.5 })

      for (let i = 0; i < 100; i++) {
        expect(actor.getTypingSpeed(300, 600)).toBeWithinRange(300, 450)
      }
    })
  })
})
