/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Gabin Aureche <hello@gabinaureche.com>
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
    function TheaterJS (options) {
        var self     = this,
            defaults = { autoplay: true, erase: true, locale: "detect" };

        self.options = self.utils.merge(defaults, options || {}); // merge defaults with given options

        if (self.options.locale === "detect") {
            // Detect language with fallback to "en"
            self.options.locale = (window.navigator.languages || ["en"])[0].split("-")[0];
        }

        // If no keyboard is available for the given locale, fallback to "en".
        // This is especially usefull when using "detect" as we could not cover user's locale.
        if (!self.keyboards[self.options.locale]) {
            self.options.locale = "en";
        }

        self.utils.keyboard = self.keyboards[self.options.locale];

        self.events   = {};
        self.scene    = -1; // iterator through the scenario list
        self.scenario = []; // list of action to execute
        self.casting  = {}; // list of described actors
        self.current  = {}; // actor currently used as params
        self.state    = "ready"; // theater's state (ready or playing)
    }

    TheaterJS.prototype = {
        constructor: TheaterJS,
        version:     "1.2.0",
        keyboards:   {},


        // Set actor's voice value depending on its type
        set: function (value, args) {
            var self  = this,
                voice = self.current.voice;

            self.current.model = value;

            if (self.utils.isFunction(voice)) voice.apply(self, args);
            else voice.innerHTML = value;

            return self;
        },


        getSayingSpeed: function (filter, constant) {
            if (typeof filter !== "number") {
                constant = filter;
                filter = 0;
            }

            var self  = this,
                speed = self.current.speed + filter;

            if (speed > 1) speed = 1;

            var skill = constant ? speed : self.utils.randomFloat(speed, 1);

            return self.utils.getPercentageBetween(1000, 50, skill);
        },


        isMistaking: function () {
            var self = this;
            return self.utils.randomFloat(0, 1) > self.current.accuracy;
        },

        // parseHTML is called everytime a "say" scene plays
        parseHTML: function (speech) {
            var self = this,

            // Do a quick scan and find out if there's any HTML in the speech
            // If there is, we need to save the positions, lengths, and contents.
                baseTag = { tag: "", startAt: -1 },
                htmlTag = self.utils.copy(baseTag);

            self.current.htmlStartTags = [];
            self.current.htmlEndTags   = [];

            for (var c = 0, l = speech.length, character, tagCopy; c < l; c++) {
                character = speech.charAt(c);

                // tag starts
                if (character === '<') htmlTag.startAt = c;

                // tag's name
                if (htmlTag.startAt >= 0) htmlTag.tag += character;

                // tag ends
                if (character === '>') {
                    //htmlTag.length = c - htmlTag.pos + 1;
                    //htmlTag.length = htmlTag.string.length;

                    tagCopy = self.utils.copy(htmlTag);

                    if (htmlTag.tag.charAt(1) === '/') self.current.htmlEndTags.push(tagCopy); // closing tag
                    else self.current.htmlStartTags.push(tagCopy);

                    // Reset htmlTag
                    htmlTag = self.utils.copy(baseTag);
                }
            }

            return self;
        },

        // Remove the tags registered for current actor while str is the speech
        stripHTML: function (str) {
            var self = this;

            for (var i = 0, l = self.current.htmlStartTags.length; i < l; i++) {
                str = str.replace(self.current.htmlStartTags[i].tag, "")
                    .replace(self.current.htmlEndTags[i].tag, "");
            }

            return str;
        },

        injectHTML: function (speech, cursor) {
            var self           = this,
                numTags        = self.current.htmlStartTags.length,
                amountInserted = 0,
                startIndex     = 0,
                endIndex       = 0,
                opener, closer;

            while (startIndex < numTags) {
                opener = self.current.htmlStartTags[startIndex];
                closer = self.current.htmlEndTags[endIndex];

                if (opener.startAt < closer.startAt) {
                    // Next start tag comes before next end tag
                    if (opener.startAt <= cursor + amountInserted) {
                        // Start tag is included in portion that is being typed
                        speech = speech.substr(0, opener.startAt) + opener.tag + speech.substr(opener.startAt);
                        amountInserted += opener.tag.length;
                        startIndex++;
                    } else {
                        // Start tag is off the screen. We need to close any end tags that
                        // correspond to start tags we've already typed
                        for (var i = startIndex - 1; i >= endIndex; i--) speech += self.current.htmlEndTags[i].tag;

                        // We can return early in this case
                        return speech;
                    }
                } else {
                    // Next end tag comes before next start tag
                    if (closer.startAt <= cursor + amountInserted) {
                        // End tag is included in portion that is being typed
                        speech = speech.substr(0, closer.startAt) + closer.tag + speech.substr(closer.startAt);
                        amountInserted += closer.tag.length;
                        endIndex++;
                    } else {
                        return speech;
                    }
                }
            }

            return speech;
        },

        utils:    {
            keyboard: {},

            copy: function (obj) {
                var copy = {},
                    prop;

                for (prop in obj) if (obj.hasOwnProperty(prop)) copy[prop] = obj[prop];
                return copy;
            },

            isFunction: function (f) { return typeof f === "function"; },
            isString: function (s) { return typeof s === "string"; },
            isNumber: function (n) { return typeof n === "number"; },
            isObject: function (o) { return o instanceof Object; },

            mapKeyboard: function (alphabet) {
                var keyboard = {};

                for (var y = 0, lines = alphabet.length, chars; y < lines; y++) {
                    chars = alphabet[y];

                    for (var x = 0, charsLength = chars.length; x < charsLength; x++) {
                        keyboard[chars[x]] = { x: x, y: y };
                    }
                }

                return keyboard;
            },

            merge: function (dest, origin) {
                for (var key in origin) if (origin.hasOwnProperty(key)) dest[key] = origin[key];
                return dest;
            },

            getPercentageBetween: function (min, max, perc) {
                return (min - (min * perc)) + (max * perc);
            },

            randomCharNear: function (ch) {
                var utils = this,
                    keyboard = utils.mapKeyboard(utils.keyboard),
                    threshold = 1,
                    nearbyChars = [],
                    uppercase = !!ch.match(/[A-Z]/);

                ch = ch.toLowerCase();

                var charPosition = keyboard[ch] || [],
                    c, p;

                for (c in keyboard) {
                    if (!keyboard.hasOwnProperty(c) || c === ch) continue;

                    p = keyboard[c];

                    if (Math.abs(charPosition.x - p.x) <= threshold &&
                        Math.abs(charPosition.y - p.y) <= threshold) {
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
                    chars = utils.keyboard.join("");

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
                    experience:    .6,
                    voice:         function (newValue, newChar, prevChar, str) { console.log(newValue); },
                    model:         "",
                    htmlStartTags: [],
                    htmlEndTags:   []
                };

            actor = self.utils.merge(defaults, actor);

            if (!self.utils.isNumber(actor.speed))         actor.speed         = actor.experience;
            if (!self.utils.isNumber(actor.accuracy))      actor.accuracy      = actor.experience;
            if (!self.utils.isNumber(actor.invincibility)) actor.invincibility = actor.accuracy * 10;

            return actor;
        },


        // Add a new actor to the casting
        describe: function (name, experience, voice) {
            var self  = this,
                actor = { name: name };

            if (self.utils.isNumber(experience)) actor.experience = experience;
            else if (self.utils.isObject(experience)) actor = self.utils.merge(actor, experience);

            if (voice !== void 0) {
                // If actor's voice is a string, assume it's a query selector
                actor.voice = self.utils.isString(voice) ? d.querySelector(voice) : voice;
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

                if (self.utils.isString(scene)) {
                    var params   = scene.split(":"),
                        hasActor = (params.length > 1 && params[0].charAt(params[0].length - 1) !== '\\'),
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
            var self = this;

            if (!self.utils.isString(event)) event = void 0;
            else if (event !== void 0 && args === void 0) args = event;

            var eventName = scope + (event ? ":" + event : "");

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
                invincible = self.current.invincibility,
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

            // Save HTML tag info from current speech
            self.parseHTML(speech);

            // Strip all html from the speech
            speech = self.stripHTML(speech);

            var timeout = setTimeout(function nextChar () {
                var prevChar = model.charAt(cursor),
                    newChar, newValue;

                if (mistaken) {
                    // After a mistake, depending on the current actor's accuracy,
                    // there is 0% chance to make a mistake for the x next times.
                    invincible = self.current.invincibility;
                    mistaken   = false;
                    newChar    = null;
                    newValue   = model = model.substr(0, cursor);

                    // Last char erased
                    cursor--;
                } else {
                    cursor++;

                    newChar = speech.charAt(cursor);

                    if (--invincible < 0 && (prevChar !== newChar || self.current.accuracy <= .3) && self.isMistaking()) {
                        newChar = self.utils.randomCharNear(newChar);
                    }

                    if (newChar !== speech.charAt(cursor)) mistaken = true;
                    newValue = model += newChar;
                }

                // Inject the HTML up to the current cursor position
                newValue = self.injectHTML(newValue, cursor);

                self.set(newValue, [newValue, newChar, prevChar, speech]);

                if (mistaken || cursor < speech.length) timeout = setTimeout(nextChar, self.getSayingSpeed());
                else self.next();
            }, self.getSayingSpeed());

            return self;
        },


        erase: function (n) {
            var self = this;

            if (!self.utils.isString(self.current.model)) return self.next();

            // Reset cursor and min based on stripped string
            var speech = self.stripHTML(self.current.model),
                cursor = speech.length,
                min    = n < 0 ? cursor + 1 + n : 0;

            var timeout = setTimeout(function eraseChar () {
                var prevChar = speech.charAt(cursor),
                    newValue = speech.substr(0, --cursor);

                // Inject the HTML up to the current cursor position
                newValue = self.injectHTML(newValue, cursor);
                self.set(newValue, [newValue, null, prevChar, newValue]);
                speech = self.stripHTML(newValue);

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

    TheaterJS.prototype.keyboards.en = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    TheaterJS.prototype.keyboards.fr = ["azertyuiop", "qsdfghjklm", "wxcvbn"];

    w.TheaterJS = TheaterJS;
})(window, document);