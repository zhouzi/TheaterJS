import actor from './actor'
import utils from './helpers/utils'
import type from './helpers/type'
import keyboard from './helpers/keyboard'
import html from './helpers/html'

const DEFAULTS = { autoplay: true, erase: true, minSpeed: 80, maxSpeed: 450, locale: 'detect' }

let global = (1, eval)('this')

function theaterJS (options = {}) {
  /* ------------------------------------------------- *\
    init
  \* ------------------------------------------------- */

  options = utils.merge({}, DEFAULTS, options)

  if (options.locale === 'detect' && global != null && global.navigator != null) {
    if (type.isArray(global.navigator.languages) && type.isString(global.navigator.languages[0])) {
      options.locale = global.navigator.languages[0].substr(0, 2)
    }
  }

  if (!keyboard.supports(options.locale)) {
    options.locale = keyboard.defaultLocale
  }

  let props = { options, casting: {}, status: 'ready', onStage: null, currentScene: -1, scenario: [], events: {} }
  setCurrentActor(null)

  /* ------------------------------------------------- *\
    methods
  \* ------------------------------------------------- */

  function addActor (actorName, options = {}, callback = null) {
    let a = actor(actorName, options, callback)
    props.casting[a.name] = a

    return this
  }

  function setCurrentActor (actorName) {
    props.onStage = actorName
    return this
  }

  function getCurrentActor () {
    return props.casting[props.onStage] || null
  }

  function addScene () {
    let scenes = utils.toArray(arguments)

    scenes.forEach(scene => {
      if (type.isString(scene)) {
        let partials = scene.split(':')

        let actorName
        if (partials.length > 1 && partials[0].charAt(partials[0].length - 1) !== '\\') {
          actorName = partials.shift()

          if (props.options.erase) {
            addScene({ name: 'erase', actor: actorName })
          }
        }

        let speech = partials.join(':').replace(/\\:/g, ':')
        let sceneObj = { name: 'type', args: [speech] }

        if (actorName != null) {
          sceneObj.actor = actorName
        }

        addScene(sceneObj)
      } else if (type.isFunction(scene)) {
        addScene({ name: 'callback', args: [scene] })
      } else if (type.isNumber(scene)) {
        if (scene > 0) {
          addScene({ name: 'wait', args: [scene] })
        } else {
          addScene({ name: 'erase', args: [scene] })
        }
      } else if (type.isArray(scene)) {
        scene.forEach(function (s) { addScene(s) })
      } else if (type.isObject(scene)) {
        if (!type.isArray(scene.args)) {
          scene.args = []
        }

        scene.args.unshift(playNextScene.bind(this))
        props.scenario.push(scene)
      }
    })

    if (props.options.autoplay) play()

    return this
  }

  function play () {
    if (props.status === 'ready') {
      props.status = 'playing'
      playNextScene()
    }

    return this
  }

  function replay (done) {
    if (props.status === 'ready' || type.isFunction(done)) {
      props.currentScene = -1

      if (props.status === 'ready') play()
      else done()
    }

    return this
  }

  function stop () {
    props.status = 'ready'
    return this
  }

  function playNextScene () {
    if (props.status !== 'playing') return this

    let currentScene = props.scenario[props.currentScene]

    if (currentScene != null) publish(`${currentScene.name}:end`, currentScene)

    if (props.currentScene + 1 >= props.scenario.length) {
      props.status = 'ready'
      return this
    }

    let nextScene = props.scenario[++props.currentScene]

    if (nextScene.actor) {
      setCurrentActor(nextScene.actor)
    }

    publish(`${nextScene.name}:start`, nextScene)

    switch (nextScene.name) {
      case 'type':
        typeAction(...nextScene.args)
        break

      case 'erase':
        eraseAction(...nextScene.args)
        break

      case 'callback':
        callbackAction(...nextScene.args)
        break

      case 'wait':
        waitAction(...nextScene.args)
        break

      default:
        console.debug(`No scene handler for ${nextScene.name}`)
        break
    }

    return this
  }

  function typeAction (done, value) {
    let actor = getCurrentActor()

    let locale = props.options.locale
    let minSpeed = props.options.minSpeed
    let maxSpeed = props.options.maxSpeed
    let initialValue = actor.displayValue
    let cursor = -1
    let isFixing = false
    let previousMistakeCursor = null
    let previousFixCursor = null

    let htmlMap = html.map(value)
    value = html.strip(value)

    ;(function type () {
      let actual = html.strip(actor.displayValue.substr(initialValue.length))

      if (actual === value) return done()

      let expected = value.substr(0, cursor + 1)

      let isMistaking = actual !== expected
      let shouldBeMistaken = actor.shouldBeMistaken(actual, value, previousMistakeCursor, previousFixCursor)
      let shouldFix = isFixing || !shouldBeMistaken

      if (isMistaking && shouldFix) {
        isFixing = true
        previousMistakeCursor = null
        actor.displayValue = initialValue + html.inject(actual.substr(0, actual.length - 1), htmlMap)
        cursor--
        previousFixCursor = cursor
      } else {
        isFixing = false
        let nextChar = value.charAt(++cursor)

        if (shouldBeMistaken) {
          nextChar = keyboard.randomCharNear(nextChar, locale)

          if (previousMistakeCursor == null) {
            previousMistakeCursor = cursor
          }
        }

        actor.displayValue = initialValue + html.inject(actual + nextChar, htmlMap)
      }

      return setTimeout(type, actor.getTypingSpeed(minSpeed, maxSpeed))
    })()

    return this
  }

  function eraseAction (done, arg) {
    let actor = getCurrentActor()

    let minSpeed = props.options.minSpeed
    let maxSpeed = props.options.maxSpeed

    let value = actor.displayValue
    let htmlMap = html.map(value)

    value = html.strip(value)

    let cursor = value.length

    let speed
    let nbCharactersToErase = 0

    if (type.isNumber(arg)) {
      if (arg > 0) speed = arg
      else nbCharactersToErase = value.length + arg
    }

    (function erase () {
      if (cursor === nbCharactersToErase) return done()
      actor.displayValue = html.inject(value.substr(0, --cursor), htmlMap)

      return setTimeout(erase, speed || actor.getTypingSpeed(minSpeed, maxSpeed))
    })()

    return this
  }

  function callbackAction (done, callback) {
    callback.call(this, done)
    return this
  }

  function waitAction (done, delay) {
    setTimeout(done.bind(this), delay)
    return this
  }

  function subscribe (events, callback) {
    events.split(',').forEach(eventName => {
      eventName = eventName.trim()

      if (!type.isArray(props.events[eventName])) {
        props.events[eventName] = []
      }

      props.events[eventName].push(callback)
    })

    return this
  }

  function publish (eventName) {
    if (type.isArray(props.events[eventName])) {
      let args = [].slice.call(arguments, 1)
      args.unshift(eventName)

      let callbacks = (props.events[eventName] || []).concat(props.events['*'] || [])
      callbacks.forEach((callback) => { callback(...args) })
    }

    return this
  }

  /* ------------------------------------------------- *\
    public api
  \* ------------------------------------------------- */

  return Object.freeze({
    get options () { return props.options },
    get status () { return props.status },
    addActor,
    getCurrentActor,
    addScene,
    play,
    replay,
    stop,
    on: subscribe
  })
}

theaterJS.init = function (actorName = 'actor') {
  let theater = theaterJS()
  theater.addActor(actorName, { accuracy: 1, speed: 0.8 })
  return theater
}

export default theaterJS
