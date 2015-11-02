import type from './helpers/type'
import utils from './helpers/utils'

const DEFAULTS = { speed: 0.6, accuracy: 0.6 }
let global = (1, eval)('this')

export default function (actorName, props = {}, callback = null) {
  let displayValue = ''
  let $element

  if (type.isNumber(props)) {
    props = { speed: props, accuracy: props }
  }

  props = utils.merge({}, DEFAULTS, props)

  if (global != null && global.document != null) {
    if (callback == null) {
      callback = `#${actorName}`
    }

    if (type.isString(callback)) {
      let selector = callback
      let $e = global.document.querySelector(selector)

      if ($e != null) {
        $element = $e
        callback = function (newValue) { $element.innerHTML = newValue }
      } else {
        throw new Error(`no matches for ${actorName}'s selector: ${selector}`)
      }
    }
  }

  if (!type.isFunction(callback)) {
    callback = console.log.bind(console)
  }

  return {
    $element,

    get displayValue () {
      return displayValue
    },

    set displayValue (value) {
      displayValue = value
      callback(value)
    },

    get name () {
      return actorName
    },

    getTypingSpeed (fastest, slowest) {
      let speed = utils.randomFloat(props.speed, 1)
      return utils.getPercentageOf(slowest, fastest, speed)
    },

    shouldBeMistaken (actual, endValue, previousMistakeCursor = null, previousFixCursor = null) {
      let accuracy = props.accuracy * 10

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

      return utils.randomFloat(0, 0.8) > props.accuracy
    }
  }
}
