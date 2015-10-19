import type from './type'

const DEFAULT_LOCALE = 'en'
let keyboards = { en: [], fr: [] }

export default {
  defaultLocale: DEFAULT_LOCALE,

  supports (locale) {
    return type.isArray(keyboards[locale])
  },

  randomCharNear (char) {
    return 'q'
  }
}
