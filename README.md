# TheaterJS

Typing animation mimicking human behavior.

* [CodePen Demo](http://codepen.io/Zhouzi/full/JoRazP/)
* [Showcase](https://github.com/Zhouzi/TheaterJS#showcase)
* [Installation](https://github.com/Zhouzi/TheaterJS#installation)
* [Documentation](https://github.com/Zhouzi/TheaterJS#documentation)
* [Localized Keyboards](https://github.com/Zhouzi/TheaterJS#localized-keyboards)
* [Change Log](https://github.com/Zhouzi/TheaterJS#change-log)
* [Path from v1.x to v2](https://github.com/Zhouzi/TheaterJS/blob/master/MIGRATING.md)
* [Contribute](https://github.com/Zhouzi/TheaterJS/blob/master/CONTRIBUTING.md)

*If you're not particularly interested in managing multiple actors and the several features TheaterJS has to offer (e.g mistakes, variable speed, callbacks, html support, and so on), have a look at this [fiddle](https://jsfiddle.net/p1e9La6w/). It's a minimalist version that supports play/stop, it has a lot of comments so you understand what's going on under the hood. It might well be enough for you usage :)*

## Showcase

* [harshini raji](http://harshiniraji.in/)
* [Felix Heck](http://whotheheck.de/)
* [Alec Lomas](http://lowmess.com/)
* [IOMED](http://www.iomed.es/)
* [Lift](http://www.lift1428.com/)
* [Mātthīas' CodePen](http://codepen.io/mfritsch/full/Jdpewq/)
* [Dries Janse](https://driesjanse.be/about.html)
* [Demo Page](http://codepen.io/Zhouzi/full/JoRazP/)

Let me know if you're using TheaterJS, I'd be glad to add it to this list.

## Installation

* via bower: `bower install theaterjs`
* via npm: `npm install theaterjs`
* via CDN: `//cdn.jsdelivr.net/npm/theaterjs@latest/dist/theater.min.js`
* [direct download](https://github.com/Zhouzi/TheaterJS/releases)

Link the `theater.min.js` file and you're done: `<script src="path/to/theater.min.js"></script>`

## Example

```html
<div id="vader"></div>
<div id="luke"></div>

<script src="path/to/theater.min.js"></script>
<script>
  var theater = theaterJS()
  
  theater
    .on('type:start, erase:start', function () {
      // add a class to actor's dom element when he starts typing/erasing
      var actor = theater.getCurrentActor()
      actor.$element.classList.add('is-typing')
    })
    .on('type:end, erase:end', function () {
      // and then remove it when he's done
      var actor = theater.getCurrentActor()
      actor.$element.classList.remove('is-typing')
    })
  
  theater
    .addActor('vader')
    .addActor('luke')
    
  theater
    .addScene('vader:Luke...', 400)
    .addScene('luke:What?', 400)
    .addScene('vader:I am', 200, '.', 200, '.', 200, '. ')
    .addScene('Your father!')
    .addScene(theater.replay)
</script>
```

## Documentation

To get started, you'll first need to create a new TheaterJS object by eventually providing some options.

**Example**

```javascript
var theater = theaterJS({ locale: 'fr' })
```

**Usage**

```javascript
theaterJS(<options>)
```

Param|Default|Description
-----|-------|-----------
options|`{autoplay, locale, minSpeed, maxSpeed}`|Options *(see below)*.

Breakdown of the available options:

Option|Default|Description
----|-------|-----------
autoplay|`true`|If true, automatically play the scenario (when calling `addScene`).
locale|`detect`|Determine which keyboard to use when typing random characters (mistakes). Note: `"detect"` is an option to detect the user's locale and use if it's supported.
minSpeed|`{ erase: 80, type: 80 }`|Minimum delay between each typed characters (the lower, the faster).
maxSpeed|`{ erase: 450, type: 450 }`|The maximum delay between each typed characters (the greater, the slower).

Regarding minSpeed and maxSpeed, you can also just pass a number instead of an object.
If you do so, this value will be used for both the erase and type speed, e.g:

```json
{
  "minSpeed": {
    "erase": 80,
    "type": 80
  },
  
  "maxSpeed": {
    "erase": 450,
    "type": 450
  }
}
```

Is equivalent to:

```json
{
  "minSpeed": 80,
  "maxSpeed": 450
}
```

TheaterJS objects have two public (read only) properties:

* `theater.options`: object's options.
* `theater.status`: object's status (whether "playing", "stopping" or "ready").

### addActor

Add an actor to the casting.

**Example**

```javascript
var theater = theaterJS()

theater
  .addActor('vader')
  .addActor('luke', 0.8, '.luke-selector')
  .addActor('yoda', { accuracy: 0.4, speed: 0.6 }, function (displayValue) {
    console.log('%s said yoda', displayValue)
  })
```

**Usage**

```javascript
theater.addActor(<name>, <options>, <callback>)
```

Param|Default|Description
-----|-------|-----------
name||Name used to identify the actor.
options|0.8|Actor's options **(see below)**.
callback|**(see below)**|A function to call when actor's display value changes.

Actors have two options:

* `accuracy` (number between 0 and 1): used to determine how often an actor should make mistakes.
* `speed` (number between 0 and 1): used to determine how fast the actor types.

Note: the delay between each typed character varies to "mimick human behavior".

An actor callback is a function that is called when its display value is set.
It can also be a string, in such case TheaterJS will assume it's a DOM selector and will look for the corresponding element.
It's then going to set the element's innerHTML when the value changes.
You can safely ignore this argument if you gave the target element an id with the name of the actor, i.e:

```javascript
theater.addActor('vader')
```

In this situation, TheaterJS will look for an element that matches the selector `#vader`.
Also note that the actor will have an additional `$element` property referring to the DOM element when using a selector string.

### getCurrentActor

Return the actor that is currently playing.

**Example**

```javascript
var theater = theaterJS()

theater
  .addActor('vader')
  .addScene('vader:Luke...')
  .addScene(function (done) {
    var vader = theater.getCurrentActor()
    vader.$element.classList.add('dying')
    done()
  })
```

**Usage**

```javascript
theater.getCurrentActor()
```

### addScene

Add scenes to the scenario and play it if `options.autoplay` is true.

**Example**

```javascript
var theater = theaterJS()

theater
  .addActor('vader')
  .addScene('vader:Luke... ', 'Listen to me!', 500)
  .addScene(theater.replay)
```

**Usage**

```javascript
theater.addScene(<scene>)
```

A scene can be of 5 different types:

```javascript
theater
  .addScene('vader:Luke... ') // 1
  .addScene(800) // 2
  .addScene('I am your father!') // 3
  .addScene(-7) // 4
  .addScene('mother!')
  .addScene(function (done) {
    // do stuff
    done()
  }) // 5
```

1. `.addScene('vader:Luke... ')` erase actor's current display value, then type the new value.
2. `.addScene(800)` make a break of `800` milliseconds before playing the next scene.
3. `.addScene('I am your father!')` append value to the current actor's display value.
4. `.addScene(-7)` erase `7` characters.
5. `.addScene(fn)` call fn which receives a done callback as first argument (calling `done()` plays the next scene in the scenario).

Note that addScene actually accepts an infinite number of arguments so you could just do:

```javascript
theater
  .addScene('vader:Luke... ', 800, 'I am your father!')
  .addScene(-7, 'mother!')
  .addScene(fn)
```

### getCurrentSpeech

Return the speech that is currently playing.

**Example**

```javascript
var theater = theaterJS()

theater
  .addActor('vader')
  .addScene('vader:Luke...')
  .on('type:start', function () {
    console.log(theater.getCurrentSpeech()) // outputs 'Luke...'
  })
```

**Usage**

```javascript
theater.getCurrentSpeech()
```

### play

Play the scenario.

**Example**

```javascript
var theater = theaterJS({ autoplay: false })

theater
  .addActor('vader')
  .addScene('vader:Luke...')
  
document.querySelector('button').addEventListener('click', function () {
  theater.play()
}, false)
```

**Usage**

```javascript
theater.play()
```

### replay

Replay the scenario from scratch (can be used as a callback to create a loop).

**Example**

```javascript
var theater = theaterJS()

theater
  .addActor('vader')
  .addScene('vader:Luke...')
  .addScene(theater.replay)
```

**Usage**

```javascript
theater.replay()
```

### stop

Stop the scenario after the current playing scene ends.

**Example**

```javascript
var theater = theaterJS()

theater
  .addActor('vader')
  .addScene('vader:Luke... ', 'I am your father...')

document.querySelector('button').addEventListener('click', function () {
  theater.stop()
}, false)
```

**Usage**

```javascript
theater.stop()
```

### on

Add a callback to execute when an event is emitted (e.g when a scene starts/ends).

**Example**

```javascript
var theater = theaterJS()

theater
  .on('type:start, erase:start', function () {
    var actor = theater.getCurrentActor()
    actor.$element.classList.add('blinking-caret')
  })
  .on('type:end, erase:end', function () {
    var actor = theater.getCurrentActor()
    actor.$element.classList.remove('blinking-caret')
  })

theater
  .addActor('vader')
  .addScene('vader:Luke...')
```

**Usage**

```javascript
theater.on(<eventName>, <callback>)
```

Param|Default|Description
-----|-------|-----------
eventName||Event's name to listen to.
callback||Function to call when the event got published.

The callback function receives the event's name as first argument.

A couple of things to note:

* Listen to all event by using the shortcut: `theater.on('*', callback)`.
* An event is emitted when a sequence starts (`sequence:start`) and ends (`sequence:end`), e.g `theater.addScene('vader:Luke.', 'vader:I am your father.')` is one sequence.
* An event is emitted when the scenario starts and ends, respectively `scenario:start` and `scenario:end`.
* The scenario is stoppable within `:end` event listeners. It means that calling `theater.stop()` within a callback that listen for the `:end` of a scene will stop the scenario. This is useful for asynchronous callbacks (e.g animations).

## Localized Keyboards

When making a mistake, an actor's gonna type a random character near the one he intended to.
Those characters are taken from a "mapped" keyboard that you can configure on TheaterJS' instantiation: `theaterJS({locale: 'en'})`.
Currently, the supported ones are:

* English
* French
* Danish
* German
* Polish
* Portuguese
* Russian

Wanna add a keyboard? Have a look at the [contributing guide](https://github.com/Zhouzi/TheaterJS/blob/master/CONTRIBUTING.md#adding-a-keyboard).

## Change Log

### 3.2.0 - 2018-06-04

* add "getCurrentSpeech()"

### 3.1.0 - 2016-11-14

* add "main" property to the package.json
* remove irrelevant files from the npm package

### 3.0.0 - 2016-03-20

* disabling the erase option should still clear display value

### 2.2.1 - 2016-03-19

* fix end scenes event that throwed an error due to how `.replay()` works

### 2.2.0 - 2016-03-17

* publish an event when the scenario starts and ends
* scenario should be stoppable in `:end` events callbacks

### 2.1.0 - 2016-03-15

* emit an event when a sequence starts and ends

### 2.0.2 - 2016-03-13

* compile a non-minified version along with the minified one
* fix `window` detection
* fix bower.json configuration
* add support for slash-less void elements (e.g `<br>` instead of `<br/>`)
* fix play/stop issue [#49](https://github.com/Zhouzi/TheaterJS/issues/49)
* add option to configure erase's min/max speed independently

### 2.0.1 - 2015-11-02
 
* publish to npm, fix for non-browser environment
* add a `.npmignore` file
* add source map

### 2.0.0 - 2015-11-02

* Brand new version
