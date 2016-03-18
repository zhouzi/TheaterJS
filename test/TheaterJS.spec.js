/* global describe, it, expect, beforeEach, afterEach, jasmine, spyOn */

import './phantomjs-polyfills'
import theaterJS from '../src/theaterJS'

const LONG_TIME = 60000
let theater

describe('theaterJS', function () {
  beforeEach(function () {
    spyOn(document, 'querySelector').and.returnValue({})
  })

  afterEach(function () {
    theater = null
  })

  describe('is instantiable', function () {
    it('without any configuration', function () {
      theater = theaterJS()
      expect(theater.options).toEqual({ autoplay: true, erase: true, minSpeed: { erase: 80, type: 80 }, maxSpeed: { erase: 450, type: 450 }, locale: 'en' })
    })

    it('with some configuration', function () {
      theater = theaterJS({ autoplay: false, maxSpeed: 250 })
      expect(theater.options).toEqual({ autoplay: false, erase: true, minSpeed: { erase: 80, type: 80 }, maxSpeed: { erase: 250, type: 250 }, locale: 'en' })
    })

    it('and have an initial status of ready', function () {
      theater = theaterJS()
      expect(theater.status).toBe('ready')
    })

    it('and able to fallback to en if the given locale is not supported', function () {
      theater = theaterJS({ locale: 'whatever' })
      expect(theater.options.locale).toBe('en')
    })
  })

  it('can describe an actor, create scenes and play them', function () {
    jasmine.clock().install()

    theater = theaterJS({ autoplay: false })

    theater
      .addActor('vader')
      .addScene('vader:Luke...')

    expect(theater.status).toBe('ready')

    theater.play()

    expect(theater.status).toBe('playing')
    expect(theater.getCurrentActor().name).toBe('vader')
    expect(theater.getCurrentActor().displayValue).toBe('L')

    jasmine.clock().tick(LONG_TIME)

    expect(theater.status).toBe('ready')
    expect(theater.getCurrentActor().name).toBe('vader')
    expect(theater.getCurrentActor().displayValue).toBe('Luke...')

    jasmine.clock().uninstall()
  })

  describe('has a addScene method that', function () {
    beforeEach(function () {
      theater = theaterJS({ autoplay: false })
      theater.addActor('vader')
      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('accepts an indefinite number of arguments', function () {
      theater.addScene('vader:Hey! ', 'How u doing ', 'guys?').play()
      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('Hey! How u doing guys?')
    })

    it('also works with arrays of arguments', function () {
      theater.addScene(['vader:Hey! ', 'How u doing? ', ['Time to cut some stuff! ', ['Go on!']]]).play()
      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('Hey! How u doing? Time to cut some stuff! Go on!')
    })

    it('add a scene from an object and prepend a "done" callback in the arguments', function () {
      let fn = jasmine.createSpy('callback')
      theater.addScene(fn).play()

      expect(fn).toHaveBeenCalled()
      expect(fn.calls.argsFor(0)[0]).toEqual(jasmine.any(Function))
    })

    describe('parses arguments to create', function () {
      it('a erase and type scene when given a string prefixed by an actor\'s name', function () {
        theater.addScene('vader:Hey!').play()
        jasmine.clock().tick(LONG_TIME)

        expect(theater.getCurrentActor().name).toBe('vader')
        expect(theater.getCurrentActor().displayValue).toBe('Hey!')

        theater.addScene('vader:How u doing?').play()
        jasmine.clock().tick(LONG_TIME)

        expect(theater.getCurrentActor().name).toBe('vader')
        expect(theater.getCurrentActor().displayValue).toBe('How u doing?')
      })

      it('a type scene when given a string not prefixed by an actor\'s name', function () {
        theater.addScene('vader:Hey! ').play()
        jasmine.clock().tick(LONG_TIME)

        theater.addScene('How u doing?').play()
        jasmine.clock().tick(LONG_TIME)

        expect(theater.getCurrentActor().name).toBe('vader')
        expect(theater.getCurrentActor().displayValue).toBe('Hey! How u doing?')
      })

      it('a callback scene when given a function', function () {
        let callback = jasmine.createSpy('callback function')
        theater.addScene(callback).play()

        expect(callback).toHaveBeenCalled()
      })

      it('a wait scene when given a positive number', function () {
        let callback = jasmine.createSpy('callback function')
        theater.addScene(1000, callback).play()

        expect(theater.status).toBe('playing')

        jasmine.clock().tick(999)

        expect(theater.status).toBe('playing')
        expect(callback).not.toHaveBeenCalled()

        jasmine.clock().tick(1)

        expect(theater.status).toBe('playing')
        expect(callback).toHaveBeenCalled()
      })

      it('a erase scene when given a negative number', function () {
        theater.addScene('vader:Hello!').play()

        jasmine.clock().tick(LONG_TIME)

        expect(theater.getCurrentActor().displayValue).toBe('Hello!')

        theater.addScene(-5).play()

        jasmine.clock().tick(LONG_TIME)

        expect(theater.getCurrentActor().displayValue).toBe('H')
      })

      it('scenes and without calling play if autoplay option is disabled', function () {
        theater.addScene('vader:Hey!')
        expect(theater.status).toBe('ready')
      })

      it('scenes and call play if autoplay option is enabled', function () {
        theater = theaterJS()
        theater.addActor('vader').addScene('vader:Hey!')

        expect(theater.status).toBe('playing')
      })
    })
  })

  describe('has a play method that', function () {
    beforeEach(function () {
      theater = theaterJS({ autoplay: false })
      theater.addActor('vader').addScene('vader:Hey!')
      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('sets the current status to playing', function () {
      expect(theater.status).toBe('ready')
      theater.play()
      expect(theater.status).toBe('playing')
    })

    it('plays the next scene in the scenario', function () {
      expect(theater.status).toBe('ready')
      expect(theater.getCurrentActor()).toEqual(null)

      theater.play()

      expect(theater.status).toBe('playing')
      expect(theater.getCurrentActor().name).toBe('vader')

      jasmine.clock().tick(LONG_TIME)

      expect(theater.status).toBe('ready')
      expect(theater.getCurrentActor().displayValue).toBe('Hey!')
    })
  })

  describe('has a stop method that', function () {
    beforeEach(function () {
      jasmine.clock().install()

      theater = theaterJS()
      theater.addActor('vader').addScene('vader:Hello!', 'vader:How u doing?')
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('should stop the scenario', function () {
      expect(theater.status).toBe('playing')

      theater.stop()

      expect(theater.status).toBe('stopping')

      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('Hello!')
    })

    it('should be resume-able', function () {
      theater.stop()

      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('Hello!')

      theater.play()

      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('How u doing?')
    })

    it('shouldn\'t be conflicting if called several times alternatively', function () {
      theater.stop()
      jasmine.clock().tick(200)
      theater.play()
      jasmine.clock().tick(200)
      theater.stop()
      jasmine.clock().tick(200)
      theater.play()
      jasmine.clock().tick(200)
      theater.stop()
      jasmine.clock().tick(200)
      theater.play()

      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('How u doing?')
    })
  })

  describe('has a replay method that', function () {
    it('replays the scenario from scratch', function () {
      jasmine.clock().install()

      theater = theaterJS()
      theater.addActor('vader').addActor('luke').addScene('vader:Luke...').addScene('luke:What??')

      jasmine.clock().tick(LONG_TIME)

      expect(theater.status).toBe('ready')
      expect(theater.getCurrentActor().name).toBe('luke')

      theater.replay()

      expect(theater.status).toBe('playing')
      expect(theater.getCurrentActor().name).toBe('vader')

      jasmine.clock().uninstall()
    })
  })

  it('emit an event when a scene starts/ends', function () {
    jasmine.clock().install()

    let startCallback = jasmine.createSpy('start callback')
    let endCallback = jasmine.createSpy('end callback')

    theater = theaterJS()
    theater.on('type:start', startCallback).on('type:end', endCallback)
    theater.addActor('vader').addScene('vader:Hello!')

    expect(theater.status).toBe('playing')
    expect(startCallback.calls.count()).toBe(1)
    expect(endCallback.calls.count()).toBe(0)

    jasmine.clock().tick(LONG_TIME)

    expect(theater.status).toBe('ready')
    expect(startCallback.calls.count()).toBe(1)
    expect(endCallback.calls.count()).toBe(1)

    jasmine.clock().uninstall()
  })

  describe('handle type scenes', function () {
    beforeEach(function () {
      theater = theaterJS({ autoplay: false })
      theater.addActor('vader').addScene('vader:Hey!')

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('can type twice the same stuff', function () {
      theater.addScene('Hey!').play()
      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('Hey!Hey!')
    })

    it('has support for html', function () {
      let candidate = '<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"></h1>'

      for (let i = 0; i < 100; i++) {
        theater = theaterJS()

        theater
          .addActor('vader', 0.4, function () {})
          .addScene('vader:' + candidate)

        while (theater.status === 'playing') {
          jasmine.clock().tick(300)

          let lessThanSymbols = theater.getCurrentActor().displayValue.match(/</g)
          let greaterThanSymbols = theater.getCurrentActor().displayValue.match(/>/g)
          expect(lessThanSymbols && lessThanSymbols.length).toBe(greaterThanSymbols && greaterThanSymbols.length)
        }

        expect(theater.getCurrentActor().displayValue).toBe(candidate)
      }
    })
  })

  describe('handle erase scenes that', function () {
    beforeEach(function () {
      theater = theaterJS({ autoplay: false })
      theater.addActor('vader').addScene('vader:Hey!', { name: 'erase' })

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('erase an actor\'s displayValue', function () {
      theater.play()
      jasmine.clock().tick(LONG_TIME)
      expect(theater.getCurrentActor().displayValue).toBe('')
    })

    it('can erase a given number of characters', function () {
      theater = theaterJS({ autoplay: false })
      theater.addActor('vader').addScene('vader:Hello there!')

      theater.play()

      jasmine.clock().tick(LONG_TIME)

      expect(theater.getCurrentActor().displayValue).toBe('Hello there!')

      theater.addScene(-3)
      theater.play()

      jasmine.clock().tick(LONG_TIME)

      expect(theater.getCurrentActor().displayValue).toBe('Hello the')
    })

    it('speed can be configured', function () {
      theater = theaterJS({ autoplay: false })
      theater.addActor('vader').addScene('vader:Hello!').play()

      jasmine.clock().tick(LONG_TIME)

      theater.addScene({ name: 'erase', args: [100] }).play()

      expect(theater.getCurrentActor().displayValue).toBe('Hello')

      jasmine.clock().tick(99)
      expect(theater.getCurrentActor().displayValue).toBe('Hello')

      jasmine.clock().tick(1)
      expect(theater.getCurrentActor().displayValue).toBe('Hell')
    })

    it('has support for html', function () {
      let candidate = '<h1 id="some-id" class="some-class">Hey<br/> <strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"></h1>'

      theater = theaterJS({ autoplay: false })
      theater.addActor('vader').addScene('vader:' + candidate).play()

      jasmine.clock().tick(LONG_TIME)

      theater
        .addScene({ name: 'erase' })
        .play()

      while (theater.status === 'playing') {
        jasmine.clock().tick(300)

        let lessThanSymbols = theater.getCurrentActor().displayValue.match(/</g)
        let greaterThanSymbols = theater.getCurrentActor().displayValue.match(/>/g)
        expect(lessThanSymbols && lessThanSymbols.length).toBe(greaterThanSymbols && greaterThanSymbols.length)
      }

      expect(theater.getCurrentActor().displayValue).toBe('')
    })

    it('speed can be configured globally and independently from typing speed', function () {
      const speech = 'Hey there!'
      const typeSpeed = 100
      const eraseSpeed = 20

      theater = theaterJS({ minSpeed: { erase: eraseSpeed, type: typeSpeed }, maxSpeed: { erase: eraseSpeed, type: typeSpeed } })
      theater.addActor('vader', 1).addScene(`vader:${speech}`).addScene({ name: 'erase' })

      jasmine.clock().tick((speech.length - 1) * typeSpeed)
      expect(theater.getCurrentActor().displayValue).toBe(speech)

      // that last tick is required for the typeAction
      // to call itself, figure out that it's done typing
      // and it needs to call the done callback
      jasmine.clock().tick(typeSpeed)

      jasmine.clock().tick((speech.length - 1) * eraseSpeed)
      expect(theater.getCurrentActor().displayValue).toBe('')
    })

    it('should clear displayValue without animation if erase option is false', function () {
      theater = theaterJS({ erase: false })
      theater.addActor('vader').addScene('vader:Luke.', 'vader:I am your father.')

      theater.stop()
      jasmine.clock().tick(LONG_TIME)

      expect(theater.getCurrentActor().displayValue).toBe('Luke.')

      theater.play()

      expect(theater.getCurrentActor().displayValue).toBe('I')
    })
  })

  describe('handle callback scenes', function () {
    let spy

    beforeEach(function () {
      theater = theaterJS({ autoplay: false })
      spy = jasmine.createSpy()
      theater.addScene(spy)
    })

    it('that calls a function', function () {
      theater.play()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('handle wait scenes', function () {
    beforeEach(function () {
      theater = theaterJS({ autoplay: false })
      theater.addActor('vader')

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('that wait a given amount of time before playing next scene', function () {
      theater.addScene('vader:Hello!').play()

      jasmine.clock().tick(LONG_TIME)

      theater.addScene(800, { name: 'erase' }).play()

      jasmine.clock().tick(799)
      expect(theater.getCurrentActor().displayValue).toBe('Hello!')

      jasmine.clock().tick(1)
      expect(theater.getCurrentActor().displayValue).toBe('Hello')
    })
  })

  describe('handle sequence scenes', function () {
    let startSpy
    let endSpy

    beforeEach(function () {
      startSpy = jasmine.createSpy('sequence start')
      endSpy = jasmine.createSpy('sequence end')
      theater = theaterJS({ autoplay: false })

      theater
        .on('sequence:start', startSpy)
        .on('sequence:end', endSpy)
        .addActor('vader')
        .addScene('vader:Luke.', 'vader:I am your father.')

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('should emit an event when a sequence starts and ends', function () {
      expect(startSpy.calls.count()).toBe(0)
      expect(endSpy.calls.count()).toBe(0)

      theater.play()
      theater.stop()

      jasmine.clock().tick(LONG_TIME)
      expect(startSpy.calls.count()).toBe(1)
      expect(endSpy.calls.count()).toBe(0)

      theater.play()

      jasmine.clock().tick(LONG_TIME)
      expect(startSpy.calls.count()).toBe(1)
      expect(endSpy.calls.count()).toBe(1)
    })
  })

  describe('emit events when the scenario', function () {
    let startSpy
    let endSpy

    beforeEach(function () {
      startSpy = jasmine.createSpy('scenario starts')
      endSpy = jasmine.createSpy('scenario ends')

      theater = theaterJS({ autoplay: false })
      theater
        .on('scenario:start', startSpy)
        .on('scenario:end', endSpy)
        .addActor('vader')
        .addScene('vader:Luke.', 'vader:I am your father.')

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('starts', function () {
      expect(startSpy).not.toHaveBeenCalled()

      theater.play()

      expect(startSpy.calls.count()).toBe(1)
    })

    it('ends', function () {
      expect(endSpy).not.toHaveBeenCalled()

      theater.play()
      jasmine.clock().tick(LONG_TIME)

      expect(endSpy.calls.count()).toBe(1)
    })
  })

  it('should prevent execution of next scene when calling stop in listener', function () {
    jasmine.clock().install()

    const typeEndCallback = jasmine.createSpy('type end callback').and.callFake(function () {
      theater.stop()
    })

    theater = theaterJS()
    theater
      .on('type:end', typeEndCallback)
      .addActor('vader')
      .addScene('vader:Hey there!', 'vader:How u doing?')

    jasmine.clock().tick(LONG_TIME)

    expect(theater.status).toBe('ready')
    expect(theater.getCurrentActor().displayValue).toBe('Hey there!')
    expect(typeEndCallback.calls.count()).toBe(1)

    theater.play()
    jasmine.clock().tick(LONG_TIME)

    expect(theater.status).toBe('ready')
    expect(theater.getCurrentActor().displayValue).toBe('How u doing?')
    expect(typeEndCallback.calls.count()).toBe(2)

    jasmine.clock().uninstall()
  })
})
