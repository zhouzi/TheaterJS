/* eslint-disable prefer-rest-params, no-restricted-syntax, no-prototype-builtins, no-continue, no-param-reassign */

export default {
  merge(dst) {
    const objs = [].slice.call(arguments, 1);

    for (let i = 0, len = objs.length; i < len; i += 1) {
      const obj = objs[i];

      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        dst[key] = obj[key];
      }
    }

    return dst;
  },

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  getPercentageOf(min, max, percentage) {
    return min - min * percentage + max * percentage;
  }
};
