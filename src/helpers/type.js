function toString(o) {
  return {}.toString.call(o);
}

export default {
  isNumber(o) {
    return typeof o === "number";
  },

  isString(o) {
    return toString(o) === "[object String]";
  },

  isObject(o) {
    return toString(o) === "[object Object]";
  },

  isArray(o) {
    return toString(o) === "[object Array]";
  },

  isFunction(o) {
    return typeof o === "function";
  }
};
