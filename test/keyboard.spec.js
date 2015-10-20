/* global describe, it, expect, spyOn */

import keyboard from '../src/helpers/keyboard'

describe('keyboard utils', function () {
  it('has a supports method that checks if a given locale is supported', function () {
    expect(keyboard.supports('whatever')).toBe(false)
    expect(keyboard.supports('en')).toBe(true)
  })

  describe('has a randomCharNear method that', function () {
    it('returns a character near another one', function () {
      for (let i = 0; i < 100; i++) {
        expect(['a', 'e', 'q', 's', 'd']).toContain(keyboard.randomCharNear('z', 'fr'))
      }

      for (let i = 0; i < 100; i++) {
        expect(['q', 'e', 'a', 's', 'd']).toContain(keyboard.randomCharNear('w', 'en'))
      }
    })

    it('returns an uppercase character when given one', function () {
      for (let i = 0; i < 100; i++) {
        expect(['A', 'E', 'Q', 'S', 'D']).toContain(keyboard.randomCharNear('Z', 'fr'))
      }

      for (let i = 0; i < 100; i++) {
        expect(['Q', 'E', 'A', 'S', 'D']).toContain(keyboard.randomCharNear('W', 'en'))
      }
    })

    it('returns a random character when given an unknown one', function () {
      spyOn(keyboard, 'randomChar')
      keyboard.randomCharNear('%', 'fr')
      expect(keyboard.randomChar).toHaveBeenCalled()
    })
  })

  it('has a randomChar method that returns a random character', function () {
    for (let i = 0; i < 100; i++) {
      expect(/[a-z]/.test(keyboard.randomChar('fr'))).toBe(true)
    }
  })
})
