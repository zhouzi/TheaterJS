/* global window */
/* eslint-disable no-param-reassign, no-use-before-define, no-shadow */
import actor from "./Actor";
import keyboard from "./keyboard";
import html from "./html";

const NAVIGATOR = typeof window !== "undefined" && window.navigator;
const DEFAULTS = {
  autoplay: true,
  erase: true,
  minSpeed: { erase: 80, type: 80 },
  maxSpeed: { erase: 450, type: 450 },
  locale: "detect"
};

function theaterJS(options = {}) {
  /* ------------------------------------------------- *\
    init
  \* ------------------------------------------------- */

  options = {
    ...DEFAULTS,
    ...options
  };

  if (typeof options.minSpeed === "number") {
    const { minSpeed } = options;
    options.minSpeed = { erase: minSpeed, type: minSpeed };
  }

  if (typeof options.maxSpeed === "number") {
    const { maxSpeed } = options;
    options.maxSpeed = { erase: maxSpeed, type: maxSpeed };
  }

  if (options.locale === "detect" && NAVIGATOR) {
    const { languages } = NAVIGATOR;
    if (Array.isArray(languages) && typeof languages[0] === "string") {
      options.locale = languages[0].substr(0, 2);
    }
  }

  if (!keyboard.supports(options.locale)) {
    options.locale = keyboard.defaultLocale;
  }

  const props = {
    options,
    casting: {},
    status: "ready",
    onStage: null,
    currentScene: -1,
    scenario: [],
    events: {}
  };
  setCurrentActor(null);

  /* ------------------------------------------------- *\
    methods
  \* ------------------------------------------------- */

  function addActor(actorName, options = {}, callback = null) {
    const a = actor(actorName, options, callback);
    props.casting[a.name] = a;

    return this;
  }

  function setCurrentActor(actorName) {
    props.onStage = actorName;
    return this;
  }

  function getCurrentActor() {
    return props.casting[props.onStage] || null;
  }

  function addScene(...scenes) {
    const sequence = [];

    function addSceneToSequence(scene) {
      if (Array.isArray(scene)) {
        scene.forEach(s => {
          addSceneToSequence(s);
        });
        return;
      }

      if (typeof scene === "string") {
        const partials = scene.split(":");

        let actorName;
        if (
          partials.length > 1 &&
          partials[0].charAt(partials[0].length - 1) !== "\\"
        ) {
          actorName = partials.shift();

          addSceneToSequence({ name: "erase", actor: actorName });
        }

        const speech = partials.join(":").replace(/\\:/g, ":");
        const sceneObj = { name: "type", args: [speech] };

        if (actorName != null) {
          sceneObj.actor = actorName;
        }

        addSceneToSequence(sceneObj);
        return;
      }

      if (typeof scene === "function") {
        addSceneToSequence({ name: "callback", args: [scene] });
        return;
      }

      if (typeof scene === "number") {
        if (scene > 0) {
          addSceneToSequence({ name: "wait", args: [scene] });
        } else {
          addSceneToSequence({ name: "erase", args: [scene] });
        }
        return;
      }

      // scene is considered an object at this point
      if (!Array.isArray(scene.args)) {
        scene.args = [];
      }

      scene.args.unshift(() => {
        publish(`${scene.name}:end`, scene);
        playNextScene();
      });

      sequence.push(scene);
    }

    addSceneToSequence(
      [{ name: "publisher", args: ["sequence:start"] }]
        .concat(scenes)
        .concat({ name: "publisher", args: ["sequence:end"] })
    );
    Array.prototype.push.apply(props.scenario, sequence);

    if (props.options.autoplay) {
      play();
    }

    return this;
  }

  function getCurrentSpeech() {
    const currentScene = props.scenario[props.currentScene];
    if (!currentScene || !Array.isArray(currentScene.args)) return null;
    const [, speech] = currentScene.args;
    return speech || null;
  }

  function play() {
    if (props.status === "stopping") {
      props.status = "playing";
    }

    if (props.status === "ready") {
      props.status = "playing";
      playNextScene();
    }

    return this;
  }

  function replay(done) {
    if (props.status === "ready" || typeof done === "function") {
      props.currentScene = -1;

      if (props.status === "ready") play();
      else done();
    }

    return this;
  }

  function stop() {
    props.status = "stopping";
    return this;
  }

  function playNextScene() {
    if (props.status === "stopping") {
      props.status = "ready";
      return this;
    }

    if (props.status !== "playing") return this;

    if (props.currentScene + 1 >= props.scenario.length) {
      props.status = "ready";
      publish("scenario:end");
      return this;
    }

    props.currentScene += 1;
    const nextScene = props.scenario[props.currentScene];

    if (props.currentScene === 0) {
      publish("scenario:start");
    }

    if (nextScene.name === "publisher") {
      const [done, ...args] = nextScene.args;
      publish(...args);

      return done();
    }

    if (nextScene.actor) {
      setCurrentActor(nextScene.actor);
    }

    publish(`${nextScene.name}:start`, nextScene);

    switch (nextScene.name) {
      case "type":
        typeAction(...nextScene.args);
        break;

      case "erase":
        eraseAction(...nextScene.args);
        break;

      case "callback":
        callbackAction(...nextScene.args);
        break;

      case "wait":
        waitAction(...nextScene.args);
        break;

      default:
        console.debug(`No scene handler for ${nextScene.name}`);
        break;
    }

    return this;
  }

  function typeAction(done, value) {
    const actor = getCurrentActor();

    const { locale } = props.options;
    const minSpeed = props.options.minSpeed.type;
    const maxSpeed = props.options.maxSpeed.type;
    const initialValue = actor.displayValue;
    let cursor = -1;
    let isFixing = false;
    let previousMistakeCursor = null;
    let previousFixCursor = null;

    const htmlMap = html.map(value);
    value = html.strip(value);
    (function type() {
      const actual = html.strip(actor.displayValue.substr(initialValue.length));

      if (actual === value) return done();

      const expected = value.substr(0, cursor + 1);

      const isMistaking = actual !== expected;
      const shouldBeMistaken = actor.shouldBeMistaken(
        actual,
        value,
        previousMistakeCursor,
        previousFixCursor
      );
      const shouldFix = isFixing || !shouldBeMistaken;

      if (isMistaking && shouldFix) {
        isFixing = true;
        previousMistakeCursor = null;
        actor.displayValue =
          initialValue +
          html.inject(actual.substr(0, actual.length - 1), htmlMap);
        cursor -= 1;
        previousFixCursor = cursor;
      } else {
        isFixing = false;
        cursor += 1;
        let nextChar = value.charAt(cursor);

        if (shouldBeMistaken) {
          nextChar = keyboard.randomCharNear(nextChar, locale);

          if (previousMistakeCursor == null) {
            previousMistakeCursor = cursor;
          }
        }

        actor.displayValue =
          initialValue + html.inject(actual + nextChar, htmlMap);
      }

      return setTimeout(type, actor.getTypingSpeed(minSpeed, maxSpeed));
    })();

    return this;
  }

  function eraseAction(done, arg) {
    const actor = getCurrentActor();

    // erase scenes are added before a type scene
    // so for the first scene, there's no actor yet
    if (actor == null) {
      return done();
    }

    if (options.erase !== true) {
      actor.displayValue = "";
      return done();
    }

    const minSpeed = props.options.minSpeed.erase;
    const maxSpeed = props.options.maxSpeed.erase;

    let value = actor.displayValue;
    const htmlMap = html.map(value);

    value = html.strip(value);

    let cursor = value.length;

    let speed;
    let nbCharactersToErase = 0;

    if (typeof arg === "number") {
      if (arg > 0) speed = arg;
      else nbCharactersToErase = value.length + arg;
    }

    (function erase() {
      if (cursor === nbCharactersToErase) return done();
      cursor -= 1;
      actor.displayValue = html.inject(value.substr(0, cursor), htmlMap);

      return setTimeout(
        erase,
        speed || actor.getTypingSpeed(minSpeed, maxSpeed)
      );
    })();

    return this;
  }

  function callbackAction(done, callback) {
    callback.call(this, done);
    return this;
  }

  function waitAction(done, delay) {
    setTimeout(done.bind(this), delay);
    return this;
  }

  function subscribe(events, callback) {
    events.split(",").forEach(eventName => {
      eventName = eventName.trim();

      if (!Array.isArray(props.events[eventName])) {
        props.events[eventName] = [];
      }

      props.events[eventName].push(callback);
    });

    return this;
  }

  function publish(...args) {
    const eventName = args[0];
    const callbacks = props.events[eventName] || [];

    if (callbacks.length > 0) {
      callbacks
        .concat(props.events["*"] || [])
        .forEach(callback => callback(...args));
    }

    return this;
  }

  /* ------------------------------------------------- *\
    public api
  \* ------------------------------------------------- */

  return Object.freeze({
    get options() {
      return props.options;
    },
    get status() {
      return props.status;
    },
    addActor,
    getCurrentActor,
    addScene,
    getCurrentSpeech,
    play,
    replay,
    stop,
    on: subscribe
  });
}

theaterJS.init = (actorName = "actor") => {
  const theater = theaterJS();
  theater.addActor(actorName, { accuracy: 1, speed: 0.8 });
  return theater;
};

export default theaterJS;
