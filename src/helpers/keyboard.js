import type from './type'
import utils from './utils'
import keyboards from '../keyboards.json'
const DEFAULT_LOCALE = 'en'

for (let locale in keyboards) {
  if (!keyboards.hasOwnProperty(locale)) continue

  let keyboard = keyboards[locale]
  keyboards[locale] = { list: keyboard, mapped: mapKeyboard(keyboard) }
}

function mapKeyboard (alphabet) {
  let keyboard = {}

  for (let y = 0, lines = alphabet.length, chars; y < lines; y++) {
    chars = alphabet[y]

    for (let x = 0, charsLength = chars.length; x < charsLength; x++) {
      keyboard[chars[x]] = { x: x, y: y }
    }
  }

  return keyboard
}

export default {
  defaultLocale: DEFAULT_LOCALE,

  supports (locale) {
    return type.isObject(keyboards[locale])
  },

  randomCharNear (ch, locale) {
    if (!this.supports(locale)) {
      throw new Error(`locale "${locale}" is not supported`)
    }

    let keyboard = keyboards[locale].mapped
    let threshold = 1
    let nearbyChars = []
    let uppercase = /[A-Z]/.test(ch)

    ch = ch.toLowerCase()

    let charPosition = keyboard[ch] || []
    let p

    for (let c in keyboard) {
      if (!keyboard.hasOwnProperty(c) || c === ch) continue

      p = keyboard[c]

      if (Math.abs(charPosition.x - p.x) <= threshold && Math.abs(charPosition.y - p.y) <= threshold) {
        nearbyChars.push(c)
      }
    }

    let randomChar =
      nearbyChars.length > 0
      ? nearbyChars[utils.random(0, nearbyChars.length - 1)]
      : this.randomChar(locale)

    if (uppercase) {
      randomChar = randomChar.toUpperCase()
    }

    return randomChar
  },

  randomChar: function (locale) {
    if (!this.supports(locale)) {
      throw new Error(`locale "${locale}" is not supported`)
    }

    let chars = keyboards[locale].list.join('')
    return chars.charAt(utils.random(0, chars.length - 1))
  }
}
