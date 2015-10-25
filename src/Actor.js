import type from './helpers/type'
import utils from './helpers/utils'

const DEFAULTS = { speed: 0.6, accuracy: 0.6 }

export default class Actor {
  constructor (actorName, props = {}, callback = null) {
    this.name = actorName

    if (type.isNumber(props)) {
      props = { speed: props, accuracy: props }
    }

    utils.merge(this, DEFAULTS, props)

    if (document != null) {
      if (callback == null) {
        callback = `#${actorName}`
      }

      if (type.isString(callback)) {
        let selector = callback
        let $element = document.querySelector(selector)

        if ($element != null) {
          this.$element = $element
          callback = (newValue) => { this.$element.innerHTML = newValue }
        } else {
          throw new Error(`no matches for ${this.name}'s selector: ${selector}`)
        }
      }
    }

    if (!type.isFunction(callback)) {
      callback = console.log.bind(console)
    }

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
      let maxWrongCharactersAllowed = accuracy >= 6 ? 10 - accuracy : 4

      if (nbOfCharactersTyped >= maxWrongCharactersAllowed) {
        return false
      }
    }

    if (type.isNumber(previousFixCursor)) {
      let nbOfCharactersTyped = actual.length - previousFixCursor
      let minCharactersBetweenMistakes = Math.max(accuracy, 2) * 2

      if (nbOfCharactersTyped <= minCharactersBetweenMistakes) {
        return false
      }
    }

    return utils.randomFloat(0, 0.8) > this.accuracy
  }
}
