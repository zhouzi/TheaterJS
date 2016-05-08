(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["theaterJS"] = factory();
	else
		root["theaterJS"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

	var _actor = __webpack_require__(1);

	var _actor2 = _interopRequireDefault(_actor);

	var _helpersUtils = __webpack_require__(3);

	var _helpersUtils2 = _interopRequireDefault(_helpersUtils);

	var _helpersType = __webpack_require__(2);

	var _helpersType2 = _interopRequireDefault(_helpersType);

	var _helpersKeyboard = __webpack_require__(4);

	var _helpersKeyboard2 = _interopRequireDefault(_helpersKeyboard);

	var _helpersHtml = __webpack_require__(6);

	var _helpersHtml2 = _interopRequireDefault(_helpersHtml);

	var NAVIGATOR = typeof window !== 'undefined' && window.navigator;
	var DEFAULTS = {
	  autoplay: true,
	  erase: true,
	  minSpeed: { erase: 80, type: 80 },
	  maxSpeed: { erase: 450, type: 450 },
	  locale: 'detect'
	};

	function theaterJS() {
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  /* ------------------------------------------------- *\
	    init
	  \* ------------------------------------------------- */

	  options = _helpersUtils2['default'].merge({}, DEFAULTS, options);

	  if (_helpersType2['default'].isNumber(options.minSpeed)) {
	    var _options = options;
	    var minSpeed = _options.minSpeed;

	    options.minSpeed = { erase: minSpeed, type: minSpeed };
	  }

	  if (_helpersType2['default'].isNumber(options.maxSpeed)) {
	    var _options2 = options;
	    var maxSpeed = _options2.maxSpeed;

	    options.maxSpeed = { erase: maxSpeed, type: maxSpeed };
	  }

	  if (options.locale === 'detect' && NAVIGATOR) {
	    var languages = NAVIGATOR.languages;
	    if (_helpersType2['default'].isArray(languages) && _helpersType2['default'].isString(languages[0])) {
	      options.locale = languages[0].substr(0, 2);
	    }
	  }

	  if (!_helpersKeyboard2['default'].supports(options.locale)) {
	    options.locale = _helpersKeyboard2['default'].defaultLocale;
	  }

	  var props = { options: options, casting: {}, status: 'ready', onStage: null, currentScene: -1, scenario: [], events: {} };
	  setCurrentActor(null);

	  /* ------------------------------------------------- *\
	    methods
	  \* ------------------------------------------------- */

	  function addActor(actorName) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	    var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	    var a = (0, _actor2['default'])(actorName, options, callback);
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

	  function addScene() {
	    var sequence = [];

	    function addSceneToSequence(scene) {
	      if (_helpersType2['default'].isArray(scene)) {
	        scene.forEach(function (s) {
	          addSceneToSequence(s);
	        });
	      }

	      if (_helpersType2['default'].isString(scene)) {
	        var partials = scene.split(':');

	        var actorName = undefined;
	        if (partials.length > 1 && partials[0].charAt(partials[0].length - 1) !== '\\') {
	          actorName = partials.shift();

	          addSceneToSequence({ name: 'erase', actor: actorName });
	        }

	        var speech = partials.join(':').replace(/\\:/g, ':');
	        var sceneObj = { name: 'type', args: [speech] };

	        if (actorName != null) {
	          sceneObj.actor = actorName;
	        }

	        addSceneToSequence(sceneObj);
	      }

	      if (_helpersType2['default'].isFunction(scene)) {
	        addSceneToSequence({ name: 'callback', args: [scene] });
	      }

	      if (_helpersType2['default'].isNumber(scene)) {
	        if (scene > 0) {
	          addSceneToSequence({ name: 'wait', args: [scene] });
	        } else {
	          addSceneToSequence({ name: 'erase', args: [scene] });
	        }
	      }

	      if (_helpersType2['default'].isObject(scene)) {
	        if (!_helpersType2['default'].isArray(scene.args)) {
	          scene.args = [];
	        }

	        scene.args.unshift(function () {
	          publish(scene.name + ':end', scene);
	          playNextScene();
	        });

	        sequence.push(scene);
	      }
	    }

	    for (var _len = arguments.length, scenes = Array(_len), _key = 0; _key < _len; _key++) {
	      scenes[_key] = arguments[_key];
	    }

	    addSceneToSequence([{ name: 'publisher', args: ['sequence:start'] }].concat(scenes).concat({ name: 'publisher', args: ['sequence:end'] }));
	    Array.prototype.push.apply(props.scenario, sequence);

	    if (props.options.autoplay) {
	      play();
	    }

	    return this;
	  }

	  function play() {
	    if (props.status === 'stopping') {
	      props.status = 'playing';
	    }

	    if (props.status === 'ready') {
	      props.status = 'playing';
	      playNextScene();
	    }

	    return this;
	  }

	  function replay(done) {
	    if (props.status === 'ready' || _helpersType2['default'].isFunction(done)) {
	      props.currentScene = -1;

	      if (props.status === 'ready') play();else done();
	    }

	    return this;
	  }

	  function stop() {
	    props.status = 'stopping';
	    return this;
	  }

	  function playNextScene() {
	    if (props.status === 'stopping') {
	      props.status = 'ready';
	      return this;
	    }

	    if (props.status !== 'playing') return this;

	    if (props.currentScene + 1 >= props.scenario.length) {
	      props.status = 'ready';
	      publish('scenario:end');
	      return this;
	    }

	    var nextScene = props.scenario[++props.currentScene];

	    if (props.currentScene === 0) {
	      publish('scenario:start');
	    }

	    if (nextScene.name === 'publisher') {
	      var _nextScene$args = _toArray(nextScene.args);

	      var done = _nextScene$args[0];

	      var args = _nextScene$args.slice(1);

	      publish.apply(undefined, _toConsumableArray(args));

	      return done();
	    }

	    if (nextScene.actor) {
	      setCurrentActor(nextScene.actor);
	    }

	    publish(nextScene.name + ':start', nextScene);

	    switch (nextScene.name) {
	      case 'type':
	        typeAction.apply(undefined, _toConsumableArray(nextScene.args));
	        break;

	      case 'erase':
	        eraseAction.apply(undefined, _toConsumableArray(nextScene.args));
	        break;

	      case 'callback':
	        callbackAction.apply(undefined, _toConsumableArray(nextScene.args));
	        break;

	      case 'wait':
	        waitAction.apply(undefined, _toConsumableArray(nextScene.args));
	        break;

	      default:
	        console.debug('No scene handler for ' + nextScene.name);
	        break;
	    }

	    return this;
	  }

	  function typeAction(done, value) {
	    var actor = getCurrentActor();

	    var locale = props.options.locale;
	    var minSpeed = props.options.minSpeed.type;
	    var maxSpeed = props.options.maxSpeed.type;
	    var initialValue = actor.displayValue;
	    var cursor = -1;
	    var isFixing = false;
	    var previousMistakeCursor = null;
	    var previousFixCursor = null;

	    var htmlMap = _helpersHtml2['default'].map(value);
	    value = _helpersHtml2['default'].strip(value);(function type() {
	      var actual = _helpersHtml2['default'].strip(actor.displayValue.substr(initialValue.length));

	      if (actual === value) return done();

	      var expected = value.substr(0, cursor + 1);

	      var isMistaking = actual !== expected;
	      var shouldBeMistaken = actor.shouldBeMistaken(actual, value, previousMistakeCursor, previousFixCursor);
	      var shouldFix = isFixing || !shouldBeMistaken;

	      if (isMistaking && shouldFix) {
	        isFixing = true;
	        previousMistakeCursor = null;
	        actor.displayValue = initialValue + _helpersHtml2['default'].inject(actual.substr(0, actual.length - 1), htmlMap);
	        cursor--;
	        previousFixCursor = cursor;
	      } else {
	        isFixing = false;
	        var nextChar = value.charAt(++cursor);

	        if (shouldBeMistaken) {
	          nextChar = _helpersKeyboard2['default'].randomCharNear(nextChar, locale);

	          if (previousMistakeCursor == null) {
	            previousMistakeCursor = cursor;
	          }
	        }

	        actor.displayValue = initialValue + _helpersHtml2['default'].inject(actual + nextChar, htmlMap);
	      }

	      return setTimeout(type, actor.getTypingSpeed(minSpeed, maxSpeed));
	    })();

	    return this;
	  }

	  function eraseAction(done, arg) {
	    var actor = getCurrentActor();

	    // erase scenes are added before a type scene
	    // so for the first scene, there's no actor yet
	    if (actor == null) {
	      return done();
	    }

	    if (options.erase !== true) {
	      actor.displayValue = '';
	      return done();
	    }

	    var minSpeed = props.options.minSpeed.erase;
	    var maxSpeed = props.options.maxSpeed.erase;

	    var value = actor.displayValue;
	    var htmlMap = _helpersHtml2['default'].map(value);

	    value = _helpersHtml2['default'].strip(value);

	    var cursor = value.length;

	    var speed = undefined;
	    var nbCharactersToErase = 0;

	    if (_helpersType2['default'].isNumber(arg)) {
	      if (arg > 0) speed = arg;else nbCharactersToErase = value.length + arg;
	    }

	    (function erase() {
	      if (cursor === nbCharactersToErase) return done();
	      actor.displayValue = _helpersHtml2['default'].inject(value.substr(0, --cursor), htmlMap);

	      return setTimeout(erase, speed || actor.getTypingSpeed(minSpeed, maxSpeed));
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
	    events.split(',').forEach(function (eventName) {
	      eventName = eventName.trim();

	      if (!_helpersType2['default'].isArray(props.events[eventName])) {
	        props.events[eventName] = [];
	      }

	      props.events[eventName].push(callback);
	    });

	    return this;
	  }

	  function publish() {
	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }

	    var eventName = args[0];
	    var callbacks = props.events[eventName] || [];

	    if (callbacks.length > 0) {
	      callbacks.concat(props.events['*'] || []).forEach(function (callback) {
	        return callback.apply(undefined, args);
	      });
	    }

	    return this;
	  }

	  /* ------------------------------------------------- *\
	    public api
	  \* ------------------------------------------------- */

	  return Object.freeze(Object.defineProperties({
	    addActor: addActor,
	    getCurrentActor: getCurrentActor,
	    addScene: addScene,
	    play: play,
	    replay: replay,
	    stop: stop,
	    on: subscribe
	  }, {
	    options: {
	      get: function get() {
	        return props.options;
	      },
	      configurable: true,
	      enumerable: true
	    },
	    status: {
	      get: function get() {
	        return props.status;
	      },
	      configurable: true,
	      enumerable: true
	    }
	  }));
	}

	theaterJS.init = function () {
	  var actorName = arguments.length <= 0 || arguments[0] === undefined ? 'actor' : arguments[0];

	  var theater = theaterJS();
	  theater.addActor(actorName, { accuracy: 1, speed: 0.8 });
	  return theater;
	};

	exports['default'] = theaterJS;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _helpersType = __webpack_require__(2);

	var _helpersType2 = _interopRequireDefault(_helpersType);

	var _helpersUtils = __webpack_require__(3);

	var _helpersUtils2 = _interopRequireDefault(_helpersUtils);

	var DOCUMENT = typeof window !== 'undefined' && window.document;
	var DEFAULTS = { speed: 0.6, accuracy: 0.6 };

	exports['default'] = function (actorName) {
	  var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	  var displayValue = '';
	  var $element = undefined;

	  if (_helpersType2['default'].isNumber(props)) {
	    props = { speed: props, accuracy: props };
	  }

	  props = _helpersUtils2['default'].merge({}, DEFAULTS, props);

	  if (DOCUMENT) {
	    if (callback == null) {
	      callback = '#' + actorName;
	    }

	    if (_helpersType2['default'].isString(callback)) {
	      var selector = callback;
	      var $e = DOCUMENT.querySelector(selector);

	      if ($e != null) {
	        $element = $e;
	        callback = function (newValue) {
	          $element.innerHTML = newValue;
	        };
	      } else {
	        throw new Error('no matches for ' + actorName + '\'s selector: ' + selector);
	      }
	    }
	  }

	  if (!_helpersType2['default'].isFunction(callback)) {
	    callback = console.log.bind(console);
	  }

	  return Object.defineProperties({
	    $element: $element,

	    getTypingSpeed: function getTypingSpeed(fastest, slowest) {
	      var speed = _helpersUtils2['default'].randomFloat(props.speed, 1);
	      return _helpersUtils2['default'].getPercentageOf(slowest, fastest, speed);
	    },

	    shouldBeMistaken: function shouldBeMistaken(actual, endValue) {
	      var previousMistakeCursor = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	      var previousFixCursor = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

	      var accuracy = props.accuracy * 10;

	      if (accuracy >= 8) {
	        return false;
	      }

	      if (actual.length <= accuracy) {
	        return false;
	      }

	      if (actual.length === endValue.length) {
	        return false;
	      }

	      if (_helpersType2['default'].isNumber(previousMistakeCursor)) {
	        var nbOfCharactersTyped = actual.length - previousMistakeCursor;
	        var maxWrongCharactersAllowed = accuracy >= 6 ? 10 - accuracy : 4;

	        if (nbOfCharactersTyped >= maxWrongCharactersAllowed) {
	          return false;
	        }
	      }

	      if (_helpersType2['default'].isNumber(previousFixCursor)) {
	        var nbOfCharactersTyped = actual.length - previousFixCursor;
	        var minCharactersBetweenMistakes = Math.max(accuracy, 2) * 2;

	        if (nbOfCharactersTyped <= minCharactersBetweenMistakes) {
	          return false;
	        }
	      }

	      return _helpersUtils2['default'].randomFloat(0, 0.8) > props.accuracy;
	    }
	  }, {
	    displayValue: {
	      get: function get() {
	        return displayValue;
	      },
	      set: function set(value) {
	        displayValue = value;
	        callback(value);
	      },
	      configurable: true,
	      enumerable: true
	    },
	    name: {
	      get: function get() {
	        return actorName;
	      },
	      configurable: true,
	      enumerable: true
	    }
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	function toString(o) {
	  return ({}).toString.call(o);
	}

	exports['default'] = {
	  isNumber: function isNumber(o) {
	    return typeof o === 'number';
	  },

	  isString: function isString(o) {
	    return toString(o) === '[object String]';
	  },

	  isObject: function isObject(o) {
	    return toString(o) === '[object Object]';
	  },

	  isArray: function isArray(o) {
	    return toString(o) === '[object Array]';
	  },

	  isFunction: function isFunction(o) {
	    return typeof o === 'function';
	  }
	};
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = {
	  merge: function merge(dst) {
	    var objs = [].slice.call(arguments, 1);

	    for (var i = 0, len = objs.length; i < len; i++) {
	      var obj = objs[i];

	      for (var key in obj) {
	        if (!obj.hasOwnProperty(key)) continue;
	        dst[key] = obj[key];
	      }
	    }

	    return dst;
	  },

	  random: function random(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	  },

	  randomFloat: function randomFloat(min, max) {
	    return Math.random() * (max - min) + min;
	  },

	  getPercentageOf: function getPercentageOf(min, max, percentage) {
	    return min - min * percentage + max * percentage;
	  }
	};
	module.exports = exports["default"];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _type = __webpack_require__(2);

	var _type2 = _interopRequireDefault(_type);

	var _utils = __webpack_require__(3);

	var _utils2 = _interopRequireDefault(_utils);

	var _keyboardsJson = __webpack_require__(5);

	var _keyboardsJson2 = _interopRequireDefault(_keyboardsJson);

	var DEFAULT_LOCALE = 'en';

	for (var locale in _keyboardsJson2['default']) {
	  if (!_keyboardsJson2['default'].hasOwnProperty(locale)) continue;

	  var keyboard = _keyboardsJson2['default'][locale];
	  _keyboardsJson2['default'][locale] = { list: keyboard, mapped: mapKeyboard(keyboard) };
	}

	function mapKeyboard(alphabet) {
	  var keyboard = {};

	  for (var y = 0, lines = alphabet.length, chars = undefined; y < lines; y++) {
	    chars = alphabet[y];

	    for (var x = 0, charsLength = chars.length; x < charsLength; x++) {
	      keyboard[chars[x]] = { x: x, y: y };
	    }
	  }

	  return keyboard;
	}

	exports['default'] = {
	  defaultLocale: DEFAULT_LOCALE,

	  supports: function supports(locale) {
	    return _type2['default'].isObject(_keyboardsJson2['default'][locale]);
	  },

	  randomCharNear: function randomCharNear(ch, locale) {
	    if (!this.supports(locale)) {
	      throw new Error('locale "' + locale + '" is not supported');
	    }

	    var keyboard = _keyboardsJson2['default'][locale].mapped;
	    var threshold = 1;
	    var nearbyChars = [];
	    var uppercase = /[A-Z]/.test(ch);

	    ch = ch.toLowerCase();

	    var charPosition = keyboard[ch] || [];
	    var p = undefined;

	    for (var c in keyboard) {
	      if (!keyboard.hasOwnProperty(c) || c === ch) continue;

	      p = keyboard[c];

	      if (Math.abs(charPosition.x - p.x) <= threshold && Math.abs(charPosition.y - p.y) <= threshold) {
	        nearbyChars.push(c);
	      }
	    }

	    var randomChar = nearbyChars.length > 0 ? nearbyChars[_utils2['default'].random(0, nearbyChars.length - 1)] : this.randomChar(locale);

	    if (uppercase) {
	      randomChar = randomChar.toUpperCase();
	    }

	    return randomChar;
	  },

	  randomChar: function randomChar(locale) {
	    if (!this.supports(locale)) {
	      throw new Error('locale "' + locale + '" is not supported');
	    }

	    var chars = _keyboardsJson2['default'][locale].list.join('');
	    return chars.charAt(_utils2['default'].random(0, chars.length - 1));
	  }
	};
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
		"en": [
			"qwertyuiop",
			"asdfghjkl",
			"zxcvbnm"
		],
		"fr": [
			"azertyuiop",
			"qsdfghjklm",
			"wxcvbn"
		],
		"da": [
			"qwertyuiopå",
			"asdfghjklæø",
			"zxcvbnm"
		],
		"de": [
			"qwertzuiopü",
			"asdfghjklöä",
			"yxcvbnm"
		],
		"pl": [
			"qwertyuiopęó",
			"asdfghjkląśł",
			"zxcvbnmżźćń"
		],
		"pt": [
			"qwertyuiop",
			"asdfghjklç",
			"zxcvbnm"
		],
		"ru": [
			"йцукенгшщзх",
			"фывапролджэ",
			"ячсмитьбюъ"
		],
		"es": [
			"qwertyuiop",
			"asdfghjklñ",
			"zxcvbnm"
		]
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _voidElementsJson = __webpack_require__(7);

	var _voidElementsJson2 = _interopRequireDefault(_voidElementsJson);

	function isVoidElement(tag) {
	  var tagName = tag.match(/<([^\s>]+)/);
	  return Boolean(tagName) && _voidElementsJson2['default'].indexOf(tagName[1].toLowerCase()) > -1;
	}

	exports['default'] = {
	  strip: function strip(str) {
	    return str.replace(/(<([^>]+)>)/gi, '');
	  },

	  map: function map(str) {
	    var regexp = /<[^>]+>/gi;
	    var tags = [];
	    var openers = [];
	    var result = undefined;
	    var tag = undefined;

	    while (result = regexp.exec(str)) {
	      tag = {
	        tagName: result[0],
	        position: result.index
	      };

	      if (tag.tagName.charAt(1) === '/') {
	        tag.opener = openers.pop();
	      } else if (tag.tagName.charAt(tag.tagName.length - 2) !== '/' && !isVoidElement(tag.tagName)) {
	        openers.push(tag);
	      }

	      tags.push(tag);
	    }

	    return tags;
	  },

	  inject: function inject(str, map) {
	    for (var i = 0, tag = undefined; i < map.length; i++) {
	      tag = map[i];

	      if (str.length > 0 && tag.position <= str.length) {
	        str = str.substr(0, tag.position) + tag.tagName + str.substr(tag.position);
	      } else if (tag.opener && tag.opener.position < str.length) {
	        str += tag.tagName;
	      }
	    }

	    return str;
	  }
	};
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = [
		"area",
		"base",
		"br",
		"col",
		"embed",
		"hr",
		"img",
		"input",
		"keygen",
		"link",
		"menuitem",
		"meta",
		"param",
		"source",
		"track",
		"wbr"
	];

/***/ }
/******/ ])
});
;