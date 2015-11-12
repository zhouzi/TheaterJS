# Migrating from v1 to v2

TheaterJS' version 2 introduces lots of breaking changes and one could argue that it's almost a new library.
Hopefully, migrating from v1 to v2 should be just about renaming stuff - the core principles stayed the same.
Under the hood, TheaterJS v2 is more robust, simpler and funnier.

* [Migration Example](https://github.com/Zhouzi/TheaterJS/blob/master/MIGRATING.md#migration-example)
* [List of changes](https://github.com/Zhouzi/TheaterJS/blob/master/MIGRATING.md#list-of-changes)

Scared about the migration?
Feel free to [submit an issue](https://github.com/Zhouzi/TheaterJS/issues), I'll review the code and eventually add it as an example to this guide.

## Migration Example

### v1

[jsFiddle](http://jsfiddle.net/vtf5ueg1/2/)

```html
<div id="vader"></div>

<script src="path/to/theater.min.js"></script>
<script>
var theater = new TheaterJS()

theater
  .on('say:start, erase:start', function () {
    var currentActor = theater.current
    var currentActorElement = currentActor.voice
        
    currentActorElement.classList.add('blinking-caret')
  })
  .on('say:end, erase:end', function () {
    var currentActor = theater.current
    var currentActorElement = currentActor.voice
        
    currentActorElement.classList.remove('blinking-caret')
  })

theater
  .describe('vader', 0.8, '#vader')
  .write('vader:Luke...', -3, '.', 400)
  .write({name:'callback', args: [function () {
    // do some funny stuff like making the screen blink
    this.next()
  }, true]})
  .write('vader:I am your father...')
  .write(function () { this.play(true) })
</script>
```

### v2

[jsFiddle](http://jsfiddle.net/vtf5ueg1/3/)

```html
<div id="vader"></div>

<script src="path/to/theater.min.js"></script>
<script>
var theater = theaterJS()

theater
  .on('type:start, erase:start', function () {
    var currentActor = theater.getCurrentActor()
    var currentActorElement = currentActor.$element
    
    currentActorElement.classList.add('blinking-caret')
  })
  .on('type:end, erase:end', function () {
    var currentActor = theater.getCurrentActor()
    var currentActorElement = currentActor.$element
    
    currentActorElement.classList.remove('blinking-caret')
  })

theater
  .addActor('vader')
  .addScene('vader:Luke...', -3, '.', 400)
  .addScene(function (done) {
    // do some funny stuff like making the screen blink
    done()
  })
  .addScene('vader:I am your father...')
  .addScene(theater.replay)
</script>
```

## List of changes

* TheaterJS is now instantiated via a factory:
  * v1: `new TheaterJS()`
  * v2: `theaterJS()`
* Renamed `write` to `addScene` for clarity:
  * v1: `theater.write('vader:Luke.')`
  * v2: `theater.addScene('vader:Luke.')`
* Renamed `describe` to `addActor` for clarity and made it even simpler:
  * v1: `theater.describe('vader', 0.8, '#vader')`
  * v2: `theater.addActor('vader')` the selector default to the actor's name: `#vader`
* Added a replay method that can be used as a callback:
  * v1: `theater.write(function () { this.play(true) })`
  * v2: `theater.addScene(theater.replay)`
* Callback scenes now receive a function to call to play the next scene:
  * v1: `theater.write(function () { /* do some synchronous stuff */ })`
  * v2: `theater.write(function (done) { /* do some sync/async stuff */ done() })`
  
For more details, please have a look at the [documentation](https://github.com/Zhouzi/TheaterJS#documentation).
