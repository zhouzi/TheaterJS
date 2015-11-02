# TheaterJS

Typing effect mimicking human behavior.

* [CodePen Demo](http://codepen.io/Zhouzi/full/JoRazP/)
* [Installation](https://github.com/Zhouzi/TheaterJS#installation)
* [Documentation](https://github.com/Zhouzi/TheaterJS#documentation)
* [Change Log](https://github.com/Zhouzi/TheaterJS#change-log)
* *Path from v1.x to v2 (coming soon)*
* *Contribute (coming back soon)*

## Installation

* via bower: `bower install theaterjs`
* via npm: `npm install theaterjs`
* via a cdn: `//cdn.jsdelivr.net/theaterjs/latest/theater.min.js`
* [direct download](https://github.com/Zhouzi/TheaterJS/releases)

Link the `theater.min.js` file and you're done: `<script src="path/to/theater.min.js"></script>`

## Example

```html
<div id="vader"></div>
<div id="luke"></div>

<script>
  let theater = theaterJS()
  
  theater
    .on('type:start, erase:start', function () {
      // add a class to actor's dom element when he starts typing/erasing
      let actor = theater.getCurrentActor()
      actor.$element.classList.add('is-typing')
    })
    .on('type:end, erase:end', function () {
      // and then remove it when he's done
      let actor = theater.getCurrentActor()
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
let theater = theaterJS({ locale: 'fr' })
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
autoplay|`true`|If true, automatically play the scenario as it's constructed.
locale|`detect`|Used to determine which keyboard to use when typing random characters (for mistakes). Note: `"detect"` is an option to detect the user's locale and use if it's supported.
minSpeed|`80`|Minimum delay between each typed characters (the lower, the faster).
maxSpeed|`450`|The maximum delay between typed characters (the greater, the slower).

TheaterJS objects have two public (read only) properties:

* `theater.options`: object's options.
* `theater.status`: object's status ("playing" or "ready").

### addActor

Add an actor to the casting.

**Example**

```javascript
let theater = theaterJS()

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
Also note that the actor will have an additional `$element` property referring to the DOM element when using one of those approaches.

### getCurrentActor

Return the actor that is currently playing.

**Example**

```javascript
let theater = theaterJS()

theater
  .addActor('vader')
  .addScene('vader:Luke...')
  .addScene(function (done) {
    let vader = theater.getCurrentActor()
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
let theater = theaterJS()

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

1. `.addScene('vader:Luke... ')` erase actor's display value and set it with the new value.
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

### play

Play the scenario.

**Example**

```javascript
let theater = theaterJS({ autoplay: false })

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
let theater = theaterJS()

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
let theater = theaterJS()

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

Add a callback to execute when an event is emitted (when a scene start/end).

**Example**

```javascript
let theater = theaterJS()

theater
  .on('type:start, erase:start', function () {
    let actor = theater.getCurrentActor()
    actor.$element.classList.add('blinking-caret')
  })
  .on('type:start, erase:end', function () {
    let actor = theater.getCurrentActor()
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

Note: listen to all event by using the '*' shortcut: `theater.on('*', callback)`.

## Change Log

### 2.0.1 - 2015-11-02
 
* publish to npm, fix for non-browser environment
* add a `.npmignore` file
* add source map

### 2.0.0 - 2015-11-02

* Brand new version
