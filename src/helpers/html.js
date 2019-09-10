/* eslint-disable no-cond-assign, no-param-reassign */
import voidElements from "void-elements";

function isVoidElement(tag) {
  const tagName = tag.match(/<([^\s>]+)/);
  return Boolean(tagName) && voidElements[tagName[1].toLowerCase()] === true;
}

export default {
  strip(str) {
    return str.replace(/(<([^>]+)>)/gi, "");
  },

  map(str) {
    const regexp = /<[^>]+>/gi;
    const tags = [];
    const openers = [];
    let result;
    let tag;

    while ((result = regexp.exec(str))) {
      tag = {
        tagName: result[0],
        position: result.index
      };

      if (tag.tagName.charAt(1) === "/") {
        tag.opener = openers.pop();
      } else if (
        tag.tagName.charAt(tag.tagName.length - 2) !== "/" &&
        !isVoidElement(tag.tagName)
      ) {
        openers.push(tag);
      }

      tags.push(tag);
    }

    return tags;
  },

  inject(str, map) {
    for (let i = 0, tag; i < map.length; i += 1) {
      tag = map[i];

      if (str.length > 0 && tag.position <= str.length) {
        str =
          str.substr(0, tag.position) + tag.tagName + str.substr(tag.position);
      } else if (tag.opener && tag.opener.position < str.length) {
        str += tag.tagName;
      }
    }

    return str;
  }
};
