import Actor from './Actor'
import utils from './helpers/utils'
import type from './helpers/type'
import keyboard from './helpers/keyboard'
import html from './helpers/html'

export default class TheaterJS {
  constructor (options) {
    let defaults = { autoplay: true, erase: true, loop: true, minSpeed: 50, maxSpeed: 350, locale: 'detect' }
    this.options = utils.merge({}, defaults, options || {})

    if (this.options.locale === 'detect' && window != null) {
      if (window.navigator != null && type.isArray(window.navigator.languages) && type.isString(window.navigator.languages[0])) {
        this.options.locale = window.navigator.languages[0].substr(0, 2)
      }
    }

    if (!keyboard.supports(this.options.locale)) {
      this.options.locale = keyboard.defaultLocale
    }

    this.casting = {}
    this.status = 'ready'
    this.currentScene = -1
    this.scenario = []
    this.events = {}

    this.setCurrentActor(null)
  }

  describe (actorName, props, callback) {
    let actor = new Actor(actorName, props, callback)
    this.casting[actor.name] = actor

    return this
  }

  setCurrentActor (actorName) {
    this.onStage = actorName
    return this
  }

  getCurrentActor () {
    return this.casting[this.onStage] || null
  }

  addScene () {
    let scenes = utils.toArray(arguments)

    scenes.forEach(scene => {
      if (type.isString(scene)) {
        let partials = scene.split(':')

        let actorName
        if (partials.length > 1 && partials[0].charAt(partials[0].length - 1) !== '\\') {
          actorName = partials.shift()

          if (this.options.erase) {
            this.addScene({ name: 'erase', actor: actorName })
          }
        }

        let speech = partials.join(':').replace(/\\:/g, ':')
        let sceneObj = { name: 'type', args: [speech] }

        if (actorName != null) {
          sceneObj.actor = actorName
        }

        this.addScene(sceneObj)
      } else if (type.isFunction(scene)) {
        this.addScene({ name: 'callback', args: [scene] })
      } else if (type.isNumber(scene)) {
        if (scene > 0) {
          this.addScene({ name: 'wait', args: [scene] })
        } else {
          this.addScene({ name: 'erase', args: [scene] })
        }
      } else if (type.isArray(scene)) {
        scene.forEach(s => { this.addScene(s) })
      } else if (type.isObject(scene)) {
        if (!type.isArray(scene.args)) {
          scene.args = []
        }

        scene.args.unshift(this.playNextScene.bind(this))
        this.scenario.push(scene)
      }
    })

    if (this.options.autoplay) {
      this.play()
    }

    return this
  }

  play () {
    if (this.status === 'ready') {
      this.status = 'playing'
      this.playNextScene()
    }

    return this
  }

  replay (done) {
    if (this.status === 'ready' || type.isFunction(done)) {
      this.currentScene = -1

      if (this.status === 'ready') {
        this.play()
      } else {
        done()
      }
    }

    return this
  }

  playNextScene () {
    let currentScene = this.scenario[this.currentScene]

    if (currentScene != null) {
      this.publish(`${currentScene.name}:end`, currentScene)
    }

    if (this.currentScene + 1 >= this.scenario.length) {
      this.status = 'ready'
      return this
    }

    let nextScene = this.scenario[++this.currentScene]

    if (nextScene.actor) {
      this.setCurrentActor(nextScene.actor)
    }

    this.publish(`${nextScene.name}:start`, nextScene)

    switch (nextScene.name) {
      case 'type':
        this.typeAction.apply(this, nextScene.args)
        break

      case 'erase':
        this.eraseAction.apply(this, nextScene.args)
        break

      case 'callback':
        this.callbackAction.apply(this, nextScene.args)
        break

      case 'wait':
        this.waitAction.apply(this, nextScene.args)
        break

      default:
        console.debug(`No scene handler for ${nextScene.name}`)
        break
    }

    return this
  }

  typeAction (done, value) {
    let actor = this.getCurrentActor()

    let locale = this.options.locale
    let minSpeed = this.options.minSpeed
    let maxSpeed = this.options.maxSpeed
    let initialValue = actor.displayValue
    let cursor = -1
    let isFixing = false
    let previousMistakeCursor = null

    let htmlMap = html.map(value)
    value = html.strip(value)

    ;(function type () {
      let actual = html.strip(actor.displayValue.substr(initialValue.length))

      if (actual === value) {
        return done()
      }

      let expected = value.substr(0, cursor + 1)

      let isMistaking = actual !== expected
      let shouldBeMistaken = actor.shouldBeMistaken(actual, expected, value, previousMistakeCursor)
      let shouldFix = isFixing || !shouldBeMistaken

      if (isMistaking && shouldFix) {
        isFixing = true
        actor.displayValue = initialValue + html.inject(actual.substr(0, actual.length - 1), htmlMap)
        cursor--
      } else {
        isFixing = false
        let nextChar = value.charAt(++cursor)

        if (shouldBeMistaken) {
          nextChar = keyboard.randomCharNear(nextChar, locale)
          previousMistakeCursor = cursor
        }

        actor.displayValue = initialValue + html.inject(actual + nextChar, htmlMap)
      }

      return setTimeout(type, actor.getTypingSpeed(minSpeed, maxSpeed))
    })()

    return this
  }

  eraseAction (done, speed = null) {
    let actor = this.getCurrentActor()

    let minSpeed = this.options.minSpeed
    let maxSpeed = this.options.maxSpeed

    let value = actor.displayValue
    let htmlMap = html.map(value)

    value = html.strip(value)

    let cursor = value.length

    ;(function erase () {
      if (cursor === 0) {
        return done()
      }

      actor.displayValue = html.inject(value.substr(0, --cursor), htmlMap)
      return setTimeout(erase, speed || actor.getTypingSpeed(minSpeed, maxSpeed))
    })()

    return this
  }

  callbackAction (done, callback) {
    callback.call(this, done)
    return this
  }

  waitAction (done, delay) {
    setTimeout(done.bind(this), delay)
    return this
  }

  subscribe (events, callback) {
    events.split(',').forEach(eventName => {
      eventName = eventName.trim()

      if (!type.isArray(this.events[eventName])) {
        this.events[eventName] = []
      }

      this.events[eventName].push(callback)
    })

    return this
  }

  publish (eventName) {
    if (type.isArray(this.events[eventName])) {
      let args = [].slice.call(arguments, 1)
      args.unshift(eventName)

      let callbacks = (this.events[eventName] || []).concat(this.events['*'] || [])
      callbacks.forEach(function (callback) {
        callback.apply(this, args)
      })
    }

    return this
  }
}