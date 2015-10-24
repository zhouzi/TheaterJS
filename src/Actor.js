import type from './helpers/type'
import utils from './helpers/utils'

const DEFAULT_EXPERIENCE = 0.6

export default class Actor {
  constructor (actorName, props, callback) {
    if (!type.isString(actorName)) {
      throw new Error('actor must have a name')
    }

    if (props == null) {
      props = {}
    }

    if (callback == null && document) {
      callback = `#${actorName}`
    }

    if (type.isString(callback) && document != null) {
      let $element = document.querySelector(callback)

      if ($element != null) {
        this.$element = $element
        callback = (newValue) => { this.$element.innerHTML = newValue }
      } else {
        console.debug(`selector for ${actorName} (#${actorName}) didn't match anything`)
      }
    }

    if (!type.isFunction(callback)) {
      callback = console.log.bind(console)
    }

    this.name = actorName

    if (type.isNumber(props)) {
      props = { experience: props }
    }

    if (!type.isNumber(props.experience)) {
      props.experience = DEFAULT_EXPERIENCE
    }

    let defaults = {
      speed: props.experience,
      accuracy: props.experience
    }

    utils.merge(this, defaults, props)

    this.callback = callback
    this._displayValue = ''
  }

  set displayValue (value) {
    this._displayValue = value
    this.callback(value)
  }

  get displayValue () {
    return this._displayValue
  }

  getTypingSpeed (fastest, slowest) {
    let speed = utils.randomFloat(this.speed, 1)
    return utils.getPercentageOf(slowest, fastest, speed)
  }

  shouldBeMistaken (actual, endValue, previousMistakeCursor = null, previousFixCursor = null) {
    let accuracy = this.accuracy * 10

    if (accuracy >= 8) {
      return false
    }

    if (actual.length <= accuracy) {
      return false
    }

    if (actual.length === endValue.length) {
      return false
    }

    if (type.isNumber(previousMistakeCursor)) {
      let nbOfCharactersTyped = actual.length - previousMistakeCursor
      let maxWrongCharactersAllowed = 10 - Math.max(accuracy, 6)

      if (nbOfCharactersTyped >= maxWrongCharactersAllowed) {
        return false
      }
    }

    if (type.isNumber(previousFixCursor)) {
      if (actual.length - previousFixCursor <= Math.max(accuracy, 2) * 2) {
        return false
      }
    }

    return utils.randomFloat(0, 0.8) > this.accuracy
  }
}
