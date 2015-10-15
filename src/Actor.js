import type from './helpers/type'
import utils from './helpers/utils'

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

    if (type.isString(callback)) {
      let $element = document.querySelector(callback)

      if ($element != null) {
        callback = function (newValue) {
          $element.innerHTML = newValue
        }
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
      props.experience = 0.6
    }

    let defaults = {
      speed: props.experience,
      accuracy: props.experience,
      invincibility: props.experience * 10
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

  getTypingSpeed (min, max) {
    let speed = utils.randomFloat(this.speed, 1)
    return utils.getPercentageOf(min, max, speed)
  }

  shouldBeMistaken (actual, expected, endValue, previousMistakeCursor = null) {
    if (actual.length <= this.accuracy * 10) {
      return false
    }

    if (actual.substr(-3) !== expected.substr(-3)) {
      return false
    }

    if (actual.length === endValue.length) {
      return false
    }

    if (type.isNumber(previousMistakeCursor)) {
      let diff = actual.length - previousMistakeCursor
      let minDiff = (this.accuracy * 10) - 1

      if (diff < minDiff) {
        return false
      }
    }

    return utils.randomFloat(0, 0.8) > this.accuracy
  }
}
