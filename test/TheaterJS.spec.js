/* global describe, it, expect, beforeEach, afterEach, jasmine, spyOn */

import './phantomjs-polyfills'
import TheaterJS from '../src/TheaterJS'

let theater

describe('TheaterJS', function () {
  describe('is instantiable', function () {
    it('without any configuration', function () {
      theater = new TheaterJS()
      expect(theater.options).toEqual({ autoplay: true, erase: true, loop: true, minSpeed: 50, maxSpeed: 150, locale: 'en' })
    })

    it('with some configuration', function () {
      theater = new TheaterJS({ autoplay: false, maxSpeed: 250 })
      expect(theater.options).toEqual({ autoplay: false, erase: true, loop: true, minSpeed: 50, maxSpeed: 250, locale: 'en' })
    })

    it('and have an initial status of ready', function () {
      expect(theater.status).toBe('ready')
      expect(theater.currentScene).toBe(-1)
    })

    it('and has an option to change the locale', function () {
      theater = new TheaterJS({ locale: 'fr' })
      expect(theater.options.locale).toBe('fr')
    })

    it('and able to fallback to en if the given locale is not supported', function () {
      theater = new TheaterJS({ locale: 'whatever' })
      expect(theater.options.locale).toBe('en')
    })
  })

  describe('has a describe method that', function () {
    beforeEach(function () {
      theater = new TheaterJS()
    })

    it('add an actor to the casting', function () {
      let theater = new TheaterJS()
      expect(theater.casting).toEqual({})
      theater.describe('vader')
      expect(theater.casting.vader).toBeDefined()
    })

    it('returns the current instance so its chainable', function () {
      expect(theater.describe('vader')).toBe(theater)
    })
  })

  describe('has a addScene method that', function () {
    beforeEach(function () {
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader')
    })

    it('add a scene to the scenario', function () {
      expect(theater.scenario.length).toBe(0)
      theater.addScene('vader:Hey!')
      expect(theater.scenario.length).toBeGreaterThan(0)
    })

    it('accepts an indefinite number of arguments', function () {
      theater.addScene('vader:Hey!', 'How u doing', 'guys?')
      expect(theater.scenario.length).toBe(4)
    })

    it('also works with arrays of arguments', function () {
      theater.addScene(['vader:Hey!', 'How u doing?'], ['Time to cut some stuff!', 'Go on!'])
      expect(theater.scenario.length).toBe(5)

      theater.addScene(['vader:Hey!', 'How u doing?', ['Time to cut some stuff!', ['Go on!']]])
      expect(theater.scenario.length).toBe(10)
    })

    it('creates a scene from an object and add a "done" callback to the arguments', function () {
      theater.addScene({ name: 'whatever' })
      expect(theater.scenario.length).toBe(1)
      expect(Object.keys(theater.scenario[0])).toEqual(['name', 'args'])
      expect(theater.scenario[0].args[0]).toEqual(jasmine.any(Function))
      expect(theater.scenario[0].name).toBe('whatever')

      theater.addScene({ name: 'foo', args: ['quz'] })
      expect(theater.scenario.length).toBe(2)
      expect(Object.keys(theater.scenario[1])).toEqual(['name', 'args'])
      expect(theater.scenario[1].args[0]).toEqual(jasmine.any(Function))
      expect(theater.scenario[1].name).toBe('foo')
    })

    describe('parses arguments to create', function () {
      it('a erase and type scene when given a string prefixed by an actor\'s name', function () {
        theater.addScene('vader:Hey!')
        expect(theater.scenario.length).toBe(2)

        expect(Object.keys(theater.scenario[0])).toEqual(['name', 'actor', 'args'])
        expect(theater.scenario[0].args[0]).toEqual(jasmine.any(Function))
        expect(theater.scenario[0].name).toBe('erase')

        expect(Object.keys(theater.scenario[1])).toEqual(['name', 'args', 'actor'])
        expect(theater.scenario[1].args[0]).toEqual(jasmine.any(Function))
        expect(theater.scenario[1].name).toBe('type')
      })

      it('a type scene when given a string not prefixed by an actor\'s name', function () {
        theater.addScene('Hey!')
        expect(theater.scenario.length).toBe(1)

        expect(Object.keys(theater.scenario[0])).toEqual(['name', 'args'])
        expect(theater.scenario[0].args[0]).toEqual(jasmine.any(Function))
        expect(theater.scenario[0].name).toBe('type')
      })

      it('a callback scene when given a function', function () {
        theater.addScene(function () {})
        expect(theater.scenario.length).toBe(1)
        expect(Object.keys(theater.scenario[0])).toEqual(['name', 'args'])
        expect(theater.scenario[0].args[0]).toEqual(jasmine.any(Function))
        expect(theater.scenario[0].name).toBe('callback')
      })

      it('a wait scene when given a positive number', function () {
        theater.addScene(1000)
        expect(theater.scenario.length).toBe(1)
        expect(Object.keys(theater.scenario[0])).toEqual(['name', 'args'])
        expect(theater.scenario[0].args[0]).toEqual(jasmine.any(Function))
        expect(theater.scenario[0].name).toBe('wait')
      })

      it('a erase scene when given a negative number', function () {
        theater.addScene(-5)
        expect(theater.scenario.length).toBe(1)
        expect(Object.keys(theater.scenario[0])).toEqual(['name', 'args'])
        expect(theater.scenario[0].args[0]).toEqual(jasmine.any(Function))
        expect(theater.scenario[0].name).toBe('erase')
      })

      it('scenes and call play if autoplay option is enabled', function () {
        theater.options.autoplay = true
        spyOn(theater, 'play')
        theater.addScene('vader:Hey!')
        expect(theater.play).toHaveBeenCalled()
      })

      it('scenes and without calling play if autoplay option is disabled', function () {
        theater.options.autoplay = false
        spyOn(theater, 'play')
        theater.addScene('vader:Hey!')
        expect(theater.play).not.toHaveBeenCalled()
      })
    })
  })

  describe('has a play method that', function () {
    beforeEach(function () {
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader').addScene('vader:Hey!')
    })

    it('sets the current status to playing', function () {
      expect(theater.status).toBe('ready')
      theater.play()
      expect(theater.status).toBe('playing')
    })

    it('plays the next scene in the scenario', function () {
      spyOn(theater, 'playNextScene')
      theater.play()
      expect(theater.playNextScene).toHaveBeenCalled()
    })

    it('doesn\'t update the status nor call playNextScene when the status is not ready', function () {
      theater.status = 'whatever'
      spyOn(theater, 'playNextScene')
      theater.play()
      expect(theater.status).toBe('whatever')
      expect(theater.playNextScene).not.toHaveBeenCalled()
    })
  })

  describe('has a replay method that', function () {
    beforeEach(function () {
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader').addScene('vader:Hey!')
    })

    it('resets the current scene to its initial state', function () {
      spyOn(theater, 'play')

      theater.currentScene = 0
      theater.replay()

      expect(theater.currentScene).toBe(-1)
      expect(theater.play).toHaveBeenCalled()
    })

    it('resets the current scene to its initial state and plays the scenario', function () {
      theater.currentScene = 0
      spyOn(theater, 'play')
      theater.replay()
      expect(theater.play).toHaveBeenCalled()
    })

    it('should not alter state if not given a done callback', function () {
      spyOn(theater, 'play')
      theater.status = 'playing'
      theater.currentScene = 1
      theater.replay()

      expect(theater.status).toBe('playing')
      expect(theater.currentScene).toBe(1)
      expect(theater.play).not.toHaveBeenCalled()
    })

    it('should alter state when given a done callback', function () {
      let done = jasmine.createSpy('done callback')
      spyOn(theater, 'play')
      theater.status = 'playing'
      theater.currentScene = 1
      theater.replay(done)

      expect(theater.status).toBe('playing')
      expect(theater.currentScene).not.toBe(1)
      expect(done).toHaveBeenCalled()
    })

    it('can be used as a callback to replay a scenario', function () {
      theater = new TheaterJS({ autoplay: false })
      theater.addScene('hello', 'there', theater.replay.bind(theater))
      spyOn(theater, 'typeAction')
      theater.play()

      expect(theater.currentScene).toBe(0)
      expect(theater.typeAction).toHaveBeenCalled()
    })
  })

  describe('has a playNextScene method that', function () {
    beforeEach(function () {
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader')
    })

    it('doesn\'t increment currentScene if there are no next scene', function () {
      expect(theater.currentScene).toBe(-1)
      theater.playNextScene()
      expect(theater.currentScene).toBe(-1)

      theater.addScene('vader:Hey!')
      theater.currentScene = 2
      theater.playNextScene()
      expect(theater.currentScene).toBe(2)
    })

    it('update the status to ready if there are no next scene', function () {
      theater.status = 'playing'
      theater.playNextScene()
      expect(theater.status).toBe('ready')
    })

    it('increments currentScene if there is a next scene', function () {
      theater.addScene({ name: 'test' })
      expect(theater.currentScene).toBe(-1)
      theater.playNextScene()
      expect(theater.currentScene).toBe(0)
    })

    it('updates the actor that is on stage when the scene has an actor', function () {
      theater.addScene({ name: 'test', actor: 'vader' }, { name: 'test' }, { name: 'test', actor: 'luke' })
      expect(theater.onStage).toBe('')

      theater.playNextScene()
      expect(theater.onStage).toBe('vader')

      theater.playNextScene()
      expect(theater.onStage).toBe('vader')

      theater.playNextScene()
      expect(theater.onStage).toBe('luke')
    })

    it('calls the relevant method when playing a type scene', function () {
      spyOn(theater, 'typeAction')
      theater.addScene({ name: 'type' })
      theater.playNextScene()
      expect(theater.typeAction.calls.count()).toBe(1)
    })

    it('calls the relevant method when playing a erase scene', function () {
      spyOn(theater, 'eraseAction')
      theater.addScene({ name: 'erase' })
      theater.playNextScene()
      expect(theater.eraseAction.calls.count()).toBe(1)
    })

    it('calls the relevant method when playing a callback scene', function () {
      spyOn(theater, 'callbackAction')
      theater.addScene({ name: 'callback' })
      theater.playNextScene()
      expect(theater.callbackAction.calls.count()).toBe(1)
    })

    it('calls the relevant method when playing a wait scene', function () {
      spyOn(theater, 'waitAction')
      theater.addScene({ name: 'wait' })
      theater.playNextScene()
      expect(theater.waitAction.calls.count()).toBe(1)
    })
  })

  describe('handle type scenes', function () {
    beforeEach(function () {
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader').addScene('vader:Hey!')

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('that update an actor\'s displayValue', function () {
      expect(theater.casting.vader.displayValue).toBe('')
      theater.play()
      jasmine.clock().tick(Infinity)
      expect(theater.casting.vader.displayValue).toBe('Hey!')
    })

    it('can type twice the same stuff', function () {
      theater.addScene('Hey!').play()
      jasmine.clock().tick(Infinity)
      expect(theater.casting.vader.displayValue).toBe('Hey!Hey!')
    })
  })

  describe('handle erase scenes', function () {
    beforeEach(function () {
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader').addScene('vader:Hey!', { name: 'erase' })

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('that erase an actor\'s displayValue', function () {
      theater.play()
      jasmine.clock().tick(Infinity)
      expect(theater.casting.vader.displayValue).toBe('')
    })

    it('that speed can be configured', function () {
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader')
      theater.onStage = 'vader'
      theater.casting.vader.displayValue = 'Hello!'
      theater.addScene({ name: 'erase', args: [100] })
      theater.play()

      expect(theater.casting.vader.displayValue).toBe('Hello')

      jasmine.clock().tick(99)
      expect(theater.casting.vader.displayValue).toBe('Hello')

      jasmine.clock().tick(1)
      expect(theater.casting.vader.displayValue).toBe('Hell')
    })
  })

  describe('handle callback scenes', function () {
    let spy

    beforeEach(function () {
      theater = new TheaterJS({ autoplay: false })
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
      theater = new TheaterJS({ autoplay: false })
      theater.describe('vader').addScene(800, 'vader:Hey')

      jasmine.clock().install()
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    it('that wait a given amount of time before playing next scene', function () {
      theater.casting.vader.displayValue = 'some stuff'
      theater.play()

      expect(theater.currentScene).toBe(0)
      jasmine.clock().tick(799)
      expect(theater.currentScene).toBe(0)
      jasmine.clock().tick(1)
      expect(theater.currentScene).toBe(1)
    })
  })

  describe('has a pub sub feature that', function () {
    beforeEach(function () {
      theater = new TheaterJS()
    })

    it('is able to register callbacks', function () {
      expect(theater.events).toEqual({})

      theater.subscribe('event', function () {})
      theater.subscribe('e, evt', function () {})

      expect(theater.events.event.length).toBe(1)
      expect(theater.events.e.length).toBe(1)
      expect(theater.events.evt.length).toBe(1)

      theater.subscribe('event', function () {})

      expect(theater.events.event.length).toBe(2)
    })

    it('is able to publish events', function () {
      let spy = jasmine.createSpy('callback')

      theater.subscribe('event', spy)
      theater.publish('event', ['some', 'args'])

      expect(spy).toHaveBeenCalledWith('event', ['some', 'args'])

      theater.publish('event', 'other', 'stuff')
      expect(spy).toHaveBeenCalledWith('event', 'other', 'stuff')
    })
  })
})
