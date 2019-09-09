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
  }
};
