import actor from './actor'
import utils from './helpers/utils'
import type from './helpers/type'
import keyboard from './helpers/keyboard'
import html from './helpers/html'

const NAVIGATOR = typeof window !== 'undefined' && window.navigator
const DEFAULTS = {
  autoplay: true,
  erase: true,
  minSpeed: { erase: 80, type: 80 },
  maxSpeed: { erase: 450, type: 450 },
  locale: 'detect'
}

function theaterJS (options = {}) {
  /* ------------------------------------------------- *\
    init
  \* ------------------------------------------------- */

  options = utils.merge({}, DEFAULTS, options)

  if (type.isNumber(options.minSpeed)) {
    const { minSpeed } = options
    options.minSpeed = { erase: minSpeed, type: minSpeed }
  }

  if (type.isNumber(options.maxSpeed)) {
    const { maxSpeed } = options
    options.maxSpeed = { erase: maxSpeed, type: maxSpeed }
  }

  if (options.locale === 'detect' && NAVIGATOR) {
    let languages = NAVIGATOR.languages
    if (type.isArray(languages) && type.isString(languages[0])) {
      options.locale = languages[0].substr(0, 2)
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

  function addScene (...scenes) {
    const sequence = []

    function addSceneToSequence (scene) {
      if (type.isArray(scene)) {
        scene.forEach(function (s) { addSceneToSequence(s) })
      }

      if (type.isString(scene)) {
        let partials = scene.split(':')

        let actorName
        if (partials.length > 1 && partials[0].charAt(partials[0].length - 1) !== '\\') {
          actorName = partials.shift()

          addSceneToSequence({ name: 'erase', actor: actorName })
        }

        let speech = partials.join(':').replace(/\\:/g, ':')
        let sceneObj = { name: 'type', args: [speech] }

        if (actorName != null) {
          sceneObj.actor = actorName
        }

        addSceneToSequence(sceneObj)
      }

      if (type.isFunction(scene)) {
        addSceneToSequence({ name: 'callback', args: [scene] })
      }

      if (type.isNumber(scene)) {
        if (scene > 0) {
          addSceneToSequence({ name: 'wait', args: [scene] })
        } else {
          addSceneToSequence({ name: 'erase', args: [scene] })
        }
      }

      if (type.isObject(scene)) {
        if (!type.isArray(scene.args)) {
          scene.args = []
        }

        scene.args.unshift(function () {
          publish(`${scene.name}:end`, scene)
          playNextScene()
        })

        sequence.push(scene)
      }
    }

    addSceneToSequence([{ name: 'publisher', args: ['sequence:start'] }].concat(scenes).concat({ name: 'publisher', args: ['sequence:end'] }))
    Array.prototype.push.apply(props.scenario, sequence)

    if (props.options.autoplay) {
      play()
    }

    return this
  }

  function play () {
    if (props.status === 'stopping') {
      props.status = 'playing'
    }

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
    props.status = 'stopping'
    return this
  }

  function playNextScene () {
    if (props.status === 'stopping') {
      props.status = 'ready'
      return this
    }

    if (props.status !== 'playing') return this

    if (props.currentScene + 1 >= props.scenario.length) {
      props.status = 'ready'
      publish('scenario:end')
      return this
    }

    let nextScene = props.scenario[++props.currentScene]

    if (props.currentScene === 0) {
      publish('scenario:start')
    }

    if (nextScene.name === 'publisher') {
      const [done, ...args] = nextScene.args
      publish(...args)

      return done()
    }

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
    let minSpeed = props.options.minSpeed.type
    let maxSpeed = props.options.maxSpeed.type
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

    // erase scenes are added before a type scene
    // so for the first scene, there's no actor yet
    if (actor == null) {
      return done()
    }

    if (options.erase !== true) {
      actor.displayValue = ''
      return done()
    }

    let minSpeed = props.options.minSpeed.erase
    let maxSpeed = props.options.maxSpeed.erase

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

  function publish (...args) {
    const eventName = args[0]
    const callbacks = props.events[eventName] || []

    if (callbacks.length > 0) {
      callbacks
        .concat(props.events['*'] || [])
        .forEach(callback => callback(...args))
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
