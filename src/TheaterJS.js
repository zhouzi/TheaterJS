import Actor from './Actor'
import utils from './helpers/utils'
import type from './helpers/type'
import keyboard from './helpers/keyboard'

export default class TheaterJS {
  constructor (options) {
    let defaults = { autoplay: true, erase: true, loop: true, minSpeed: 50, maxSpeed: 150 }
    this.options = utils.merge({}, defaults, options || {})

    this.casting = {}
    this.onStage = ''
    this.status = 'ready'
    this.currentScene = -1
    this.scenario = []
    this.events = {}
  }

  describe (actorName, props, callback) {
    let actor = new Actor(actorName, props, callback)
    this.casting[actor.name] = actor

    return this
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
    if (this.currentScene + 1 >= this.scenario.length) {
      this.status = 'ready'
      return this
    }

    let scene = this.scenario[++this.currentScene]

    if (scene.actor) {
      this.onStage = scene.actor
    }

    switch (scene.name) {
      case 'type':
        this.typeAction.apply(this, scene.args)
        break

      case 'erase':
        this.eraseAction.apply(this, scene.args)
        break

      case 'callback':
        this.callbackAction.apply(this, scene.args)
        break

      case 'wait':
        this.waitAction.apply(this, scene.args)
        break

      default:
        console.debug(`No scene handler for ${scene.name}`)
        break
    }

    return this
  }

  typeAction (done, value) {
    let actor = this.casting[this.onStage]

    let minSpeed = this.options.minSpeed
    let maxSpeed = this.options.maxSpeed
    let initialValue = actor.displayValue
    let cursor = -1
    let isFixing = false
    let previousMistakeCursor = null

    ;(function type () {
      let actual = value.substr(0, cursor + 1)
      // let actual = actor.displayValue.substr(actor.displayValue.length - (cursor + 1))

      if (actual === value) {
        return done()
      }

      let expected = value.substr(0, cursor + 1)

      let isMistaking = actual !== expected
      let shouldBeMistaken = actor.shouldBeMistaken(actual, expected, value, previousMistakeCursor)
      let shouldFix = isFixing || !shouldBeMistaken

      if (isMistaking && shouldFix) {
        isFixing = true
        actor.displayValue = actor.displayValue.substr(0, actor.displayValue.length - 1)
        cursor--
      } else {
        isFixing = false
        let nextChar = value.charAt(++cursor)

        if (shouldBeMistaken) {
          nextChar = keyboard.randomCharNear(nextChar)
          previousMistakeCursor = cursor
        }

        actor.displayValue = initialValue + value.substr(0, cursor) + nextChar
        // actor.displayValue += nextChar
      }

      return setTimeout(type, actor.getTypingSpeed(minSpeed, maxSpeed))
    })()

    return this
  }

  eraseAction (done, speed = null) {
    let actor = this.casting[this.onStage]

    let minSpeed = this.options.minSpeed
    let maxSpeed = this.options.maxSpeed
    let cursor = actor.displayValue.length

    ;(function erase () {
      if (cursor === 0) {
        return done()
      }

      actor.displayValue = actor.displayValue.substr(0, --cursor)
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

      this.events[eventName].forEach(function (callback) {
        callback.apply(this, args)
      })
    }

    return this
  }
}
