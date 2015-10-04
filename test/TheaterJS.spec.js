/* global describe, beforeEach, it, expect */

import TheaterJS from '../src/TheaterJS'

describe('TheaterJS', function () {
  let theater

  beforeEach(() => {
    theater = new TheaterJS({ autoplay: false })
  })

  it('should merge user\'s options with the defaults', () => {
    expect(theater.options.autoplay).toBe(false)
  })
})
