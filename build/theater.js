/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Gabin Aureche
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

(function (w, d) {
  var qwerty = {
      q: [0,0], w: [0,1], e: [0,2], r: [0,3], t: [0,4], y: [0,5], u: [0,6], i: [0,7], o: [0,8], p: [0,9],
      a: [1,0], s: [1,1], d: [1,2], f: [1,3], g: [1,4], h: [1,5], j: [1,6], k: [1,7], l: [1,8],
      z: [2,0], x: [2,1], c: [2,2], v: [2,3], b: [2,4], n: [2,5], m: [2,6]
  };

  var azerty = {
    a: [0,0], z: [0,1], e: [0,2], r: [0,3], t: [0,4], y: [0,5], u: [0,6], i: [0,7], o: [0,8], p: [0,9],
    q: [1,0], s: [1,1], d: [1,2], f: [1,3], g: [1,4], h: [1,5], j: [1,6], k: [1,7], l: [1,8], m: [1,9],
    w: [2,0], x: [2,1], c: [2,2], v: [2,3], b: [2,4], n: [2,5]
  };

  var lang     = (window.navigator.languages || window.navigator.language || window.navigator.userLanguage)[0],
      keyboard = lang.indexOf("fr") > -1 ? azerty : qwerty;



  function TheaterJS (options) {
    var self     = this,
        defaults = { autoplay: true, erase: true };

    self.events   = {};
    self.scene    = -1; // iterator through the scenario list
    self.scenario = []; // list of action to execute
    self.options  = self.utils.merge(defaults, options || {}); // merge defaults with given options
    self.casting  = {}; // list of described actors
    self.current  = {}; // actor currently used as params
    self.state    = "ready"; // theater's state (ready or playing)
  }

  TheaterJS.prototype = {
    constructor: TheaterJS,


    // Set actor's voice value depending on its type
    set: function (value, args) {
      var self = this;

      self.current.model = value;

      switch (self.current.type) {
        case "function":
          self.current.voice.apply(self, args);
          break;

        default:
          self.current.voice.innerHTML = value;
          break;
      }

      return self;
    },


    getSayingSpeed: function (filter, constant) {
      if (typeof filter !== "number") {
        constant = filter;
        filter   = 0;
      }

      var self       = this,
          experience = self.current.experience + filter,
          skill      = constant ? experience : self.utils.randomFloat(experience, 1);

      return self.utils.getPercentageBetween(1000, 50, skill);
    },



    getInvincibility: function () {
      var self = this;
      return self.current.experience  * 10;
    },


    isMistaking: function () {
      var self = this;
      return self.current.experience < self.utils.randomFloat(0, 1.4);
    },


    utils: {
      merge: function (dest, origin) {
        for (var key in origin) if (origin.hasOwnProperty(key)) dest[key] = origin[key];
        return dest;
      },

      getPercentageBetween: function (min, max, perc) {
        return (min - (min * perc)) + (max * perc);
      },

      randomCharNear: function (ch) {
        var utils        = this,
            threshold    = 1,
            nearbyChars  = [],
            uppercase    = !!ch.match(/[A-Z]/);

        ch = ch.toLowerCase();

        var charPosition = keyboard[ch] || [],
            c, p;

        for (c in keyboard) {
          if (!keyboard.hasOwnProperty(c) || c === ch) continue;

          p = keyboard[c];

          if (Math.abs(charPosition[0] - p[0]) <= threshold &&
              Math.abs(charPosition[1] - p[1]) <= threshold) {
            nearbyChars.push(c);
          }
        }

        var randomChar = nearbyChars.length > 0 ?
                         nearbyChars[utils.randomNumber(0, nearbyChars.length - 1)] :
                         utils.randomChar();

        return uppercase ? randomChar.toUpperCase() : randomChar;
      },

      randomChar: function () {
        var utils = this,
            chars = 'abcdefghijklmnopqrstuvwxyz';

        return chars.charAt(utils.randomNumber(0, chars.length - 1));
      },

      randomNumber: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },

      randomFloat: function (min, max) {
        return Math.round((Math.random() * (max - min) + min) * 10) / 10;
      },

      hasClass: function (el, className) {
        if (el.classList) return el.classList.contains(className);
        else return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
      },

      addClass: function (el, className) {
        if (el.classList) el.classList.add(className);
        else el.className += ' ' + className;
      },

      removeClass: function (el, className) {
        if (el.classList) el.classList.remove(className);
        else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    },


    // When describing a new actor, train merges its attributes with the defaults
    train: function (actor) {
      var self     = this,
          defaults = {
            experience: .6,
            voice:      function (newValue, newChar, prevChar, str) { console.log(newValue); },
            type:       "function",
            model:      ""
          };

      return self.utils.merge(defaults, actor);
    },


    // Add a new actor to the casting
    describe: function (name, experience, voice) {
      if (typeof name !== "string") throw("actor's name has wrong type: " + typeof name);

      var self  = this,
          actor = { name: name };

      if (experience !== void 0) actor.experience = experience;

      if (voice !== void 0) {
        actor.type = typeof voice === "function" ? "function" : "DOM";

        // If actor's voice is a DOM element and a string, assume it's a query selector
        if (actor.type === "DOM") actor.voice = typeof voice === "string" ? d.querySelector(voice) : voice;
        else actor.voice = voice;
      }

      self.casting[name] = self.train(actor);
      return self;
    },


    // Add a scene to the scenario
    write: function () {
      var self   = this,
          scenes = Array.prototype.splice.apply(arguments, [0]), // the write function can have an infinite number of params
          scene;

      for (var i = 0, l = scenes.length; i < l; i++) {
        scene = scenes[i];

        if (typeof scene === "string") {
          var params   = scene.split(":"),
              hasActor = (params.length > 1 & params[0][params[0].length-1] !== '\\'),
              actor    = hasActor ? params.shift().trim() : null,
              speech   = params.join(":").replace(/\\:/g, ":");
              
          if (hasActor) self.write({ name: "actor", args: [actor] });
          if (self.options.erase && hasActor) self.write({ name: "erase" });
          self.write({ name: "say", args: [speech, !hasActor] });
        } else if (typeof scene === "number") {
          if (scene < 0) self.write({ name: "erase", args: [scene] });
          else self.write({ name: "wait", args: [scene] });
        } else if (typeof scene === "function") {
          self.write({ name: "call", args: [scene] });
        } else if (scene instanceof Object) {
          self.scenario.push(scene);
        }
      }

      // autolaunch scenario everytime something is added to the scenario
      if (self.options.autoplay) self.play();
      return self;
    },


    // Play the scenario
    play: function (restart) {
      var self = this;

      // if restart is passed as true, start from scratch
      if (restart === true) self.scene = -1;

      // if scenario is not yet playing, do it!
      if (self.state === "ready") self.next();

      return self;
    },


    // register event
    on: function (events, fn) {
      var self = this;

      events = events.split(",");

      for (var i = 0, l = events.length, event; i < l; i++) {
        event = events[i] = events[i].trim();
        (self.events[event] || (self.events[event] = [])).push(fn);
      }

      return self;
    },


    // emit event
    emit: function (scope, event, args) {
      if (typeof scope !== "string") throw("emit: scope missing");

      if (typeof event !== "string") event = void 0;
      else if (event !== void 0 && args === void 0) args = event;

      var self      = this,
          eventName = scope + (event ? ":" + event : "");

      self
        .trigger(eventName, args)
        .trigger("*", [eventName].concat(args));

      return self;
    },


    trigger: function (eventName, args) {
      var self   = this,
          events = self.events[eventName] || [];

      (args instanceof Array || (args = [args]));
      for (var i = 0, l = events.length; i < l; i++) events[i].apply(self, [eventName].concat(args));

      return self;
    },


    // Call a function
    call: function (fn, async) {
      var self = this;

      fn.apply(self);
      return !async ? self.next() : self;
    },


    // Play the next scene
    next: function () {
      var self      = this,
          prevScene = self.scenario[self.scene];

      if (prevScene) self.emit(prevScene.name, "end", [prevScene.name].concat(prevScene.args));

      if (self.scene + 1 >= self.scenario.length) {
        // If there's no next scene, set state to ready
        self.state = "ready";
      } else {
        // Otherwise, scenario is playing
        self.state = "playing";

        var nextScene = self.scenario[++self.scene];

        self.emit(nextScene.name, "start", [nextScene.name].concat(nextScene.args));
        self[nextScene.name].apply(self, nextScene.args);
      }

      return self;
    },


    actor: function (actor) {
      var self = this;

      self.current = self.casting[actor]; // set current actor from scene's actor name
      return self.next();
    },


    say: function (speech, append) {
      var self       = this,
          mistaken   = false,
          invincible = self.getInvincibility(),
          cursor, model;

      if (append) {
        // When appending instead of replacing, there's several things we need to do:
        // 1: Keep current value and append
        // 2: Set the cursor to the end of the current model's value
        // 3: Speech becomes model's value + speech
        model  = self.current.model;
        cursor = self.current.model.length - 1;
        speech = model + speech;
      } else {
        model  = self.current.model = "";
        cursor = -1;
      }

      var timeout = setTimeout(function nextChar () {
        var prevChar = model.charAt(cursor),
            newChar, newValue;

        if (mistaken) {
          // After a mistake, depending on the current actor's experience,
          // there is 0% chance to make a mistake for the x next times.
          invincible = self.getInvincibility();
          mistaken   = false;
          newChar    = null;
          newValue   = model = model.substr(0, cursor);

          // Last char erased
          cursor--;
        } else {
          cursor++;

          newChar = speech.charAt(cursor);

          if (--invincible < 0 && (prevChar !== newChar || self.current.experience <= .3) && self.isMistaking()) {
            newChar = self.utils.randomCharNear(newChar);
          }

          if (newChar !== speech.charAt(cursor)) mistaken = true;
          newValue = model += newChar;
        }

        self.set(newValue, [newValue, newChar, prevChar, speech]);

        if (mistaken || cursor < speech.length) timeout = setTimeout(nextChar, self.getSayingSpeed());
        else self.next();
      }, self.getSayingSpeed());

      return self;
    },


    erase: function (n) {
      var self   = this,
          cursor = typeof self.current.model === "string" ? self.current.model.length : -1,
          min    = typeof n === "number" && n < 0 ? cursor + 1 + n : 0;

      if (cursor < 0) return self.next();

      var timeout = setTimeout(function eraseChar () {
        var prevChar = self.current.model.charAt(cursor),
            newValue = self.current.model.substr(0, --cursor);

        self.set(newValue, [newValue, null, prevChar, newValue]);

        if (cursor >= min) setTimeout(eraseChar, self.getSayingSpeed(.2, true));
        else self.next();
      }, self.getSayingSpeed(.2, true));

      return self;
    },


    wait: function (delay) {
      var self = this;
      setTimeout(function () { self.next(); }, delay);
      return self;
    }
  };

  w.TheaterJS = TheaterJS;
})(window, document);