export default class TheaterJS {
  constructor (options) {
    this.options = {}

    for (let prop in options) {
      if (!options.hasOwnProperty(prop)) continue
      this.options[prop] = options[prop]
    }
  }
}
