function toString (o) {
  return {}.toString.call(o)
}

export default {
  isNumber: function (o) {
    return typeof o === 'number'
  },

  isString: function (o) {
    return toString(o) === '[object String]'
  },

  isObject: function (o) {
    return toString(o) === '[object Object]'
  },

  isArray: function (o) {
    return toString(o) === '[object Array]'
  },

  isFunction: function (o) {
    return typeof o === 'function'
  }
}
