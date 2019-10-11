/* eslint-disable no-restricted-syntax, no-prototype-builtins, no-continue, no-use-before-define, no-param-reassign */
import randomInt from "random-int";
import keyboards from "./keyboards.json";

const DEFAULT_LOCALE = "en";

for (const locale in keyboards) {
  if (!keyboards.hasOwnProperty(locale)) continue;

  const keyboard = keyboards[locale];
  keyboards[locale] = {
    list: keyboard,
    mapped: mapKeyboard(keyboard)
  };
}

function mapKeyboard(alphabet) {
  const keyboard = {};

  for (let y = 0, lines = alphabet.length, chars; y < lines; y += 1) {
    chars = alphabet[y];

    for (let x = 0, charsLength = chars.length; x < charsLength; x += 1) {
      keyboard[chars[x]] = { x, y };
    }
  }

  return keyboard;
}

export default {
  defaultLocale: DEFAULT_LOCALE,

  supports(locale) {
    return keyboards[locale] != null;
  },

  randomCharNear(ch, locale) {
    if (!this.supports(locale)) {
      throw new Error(`locale "${locale}" is not supported`);
    }

    const keyboard = keyboards[locale].mapped;
    const threshold = 1;
    const nearbyChars = [];
    const uppercase = /[A-Z]/.test(ch);

    ch = ch.toLowerCase();

    const charPosition = keyboard[ch] || [];
    let p;

    for (const c in keyboard) {
      if (!keyboard.hasOwnProperty(c) || c === ch) continue;

      p = keyboard[c];

      if (
        Math.abs(charPosition.x - p.x) <= threshold &&
        Math.abs(charPosition.y - p.y) <= threshold
      ) {
        nearbyChars.push(c);
      }
    }

    let randomChar =
      nearbyChars.length > 0
        ? nearbyChars[randomInt(0, nearbyChars.length - 1)]
        : this.randomChar(locale);

    if (uppercase) {
      randomChar = randomChar.toUpperCase();
    }

    return randomChar;
  },

  randomChar(locale) {
    if (!this.supports(locale)) {
      throw new Error(`locale "${locale}" is not supported`);
    }

    const chars = keyboards[locale].list.join("");
    return chars.charAt(randomInt(0, chars.length - 1));
  }
};
