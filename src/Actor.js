/* global window */
/* eslint-disable no-param-reassign */
import randomFloat from "random-float";

const DOCUMENT = typeof window !== "undefined" && window.document;
const DEFAULTS = { speed: 0.6, accuracy: 0.6 };

export default function(actorName, props = {}, callback = null) {
  let displayValue = "";
  let $element;

  if (typeof props === "number") {
    props = { speed: props, accuracy: props };
  }

  props = {
    ...DEFAULTS,
    ...props
  };

  if (DOCUMENT) {
    if (callback == null) {
      callback = `#${actorName}`;
    }

    if (typeof callback === "string") {
      const selector = callback;
      const $e = DOCUMENT.querySelector(selector);

      if ($e != null) {
        $element = $e;
        callback = newValue => {
          $element.innerHTML = newValue;
        };
      } else {
        throw new Error(`no matches for ${actorName}'s selector: ${selector}`);
      }
    }
  }

  if (typeof callback !== "function") {
    callback = console.log.bind(console);
  }

  return {
    $element,

    get displayValue() {
      return displayValue;
    },

    set displayValue(value) {
      displayValue = value;
      callback(value);
    },

    get name() {
      return actorName;
    },

    getTypingSpeed(fastest, slowest) {
      const speed = randomFloat(props.speed, 1);
      return slowest - slowest * speed + fastest * speed;
    },

    shouldBeMistaken(
      actual,
      endValue,
      previousMistakeCursor = null,
      previousFixCursor = null
    ) {
      const accuracy = props.accuracy * 10;

      if (accuracy >= 8) {
        return false;
      }

      if (actual.length <= accuracy) {
        return false;
      }

      if (actual.length === endValue.length) {
        return false;
      }

      if (typeof previousMistakeCursor === "number") {
        const nbOfCharactersTyped = actual.length - previousMistakeCursor;
        const maxWrongCharactersAllowed = accuracy >= 6 ? 10 - accuracy : 4;

        if (nbOfCharactersTyped >= maxWrongCharactersAllowed) {
          return false;
        }
      }

      if (typeof previousFixCursor === "number") {
        const nbOfCharactersTyped = actual.length - previousFixCursor;
        const minCharactersBetweenMistakes = Math.max(accuracy, 2) * 2;

        if (nbOfCharactersTyped <= minCharactersBetweenMistakes) {
          return false;
        }
      }

      return randomFloat(0, 0.8) > props.accuracy;
    }
  };
}
