# TheaterJS

**TheaterJS** is a typing effect mimicking human behavior.

* Everything you need to know is demonstrated and explained in this [codepen](http://codepen.io/Zhouzi/pen/JoRazP?editors=001).
* The demo is also available on the [TheaterJS page](http://gabinaureche.com/TheaterJS).

Feel free to submit any [suggestions/issues](https://github.com/Zhouzi/TheaterJS/issues) and [contribute](#contributing) to TheaterJS.

**Note:** Please make sure you are not confusing this project with [TheatreJS](http://theatrejs.org/).



# Usage

```javascript
  var theater = new TheaterJS();
  
  theater
    .describe("Vader", .8, "#vader")
    .describe("Luke", .6, "#luke");
    
  theater
    .write("Vader:Luke.", 600)
    .write("Luke:What?", 400)
    .write("Vader:I am...", 400, " your father.");
    
  theater
    .on("say:start, erase:start", function () {
      // add blinking caret
    })
    .on("say:end, erase:end", function () {
      // remove blinking caret
    })
    .on("*", function () {
      // do something
    });
```



# Features

* [Multiple actors](#multiple-actors)
* [Mistakes](#mistakes)
* [Keyboards & Localization](#keyboardslocalization)
* [Variable speed](#variable-speed)
* [Scenario creation](#scenario-creation)
* [Events](#events)



# Documentation

The first step is to create a new theater *instance*.

```javascript
var theater = new TheaterJS();
```



## Multiple actors

In TheaterJS, you can `describe` multiple actors, each one having its own `experience`.
Their `experience` is what defines their ability to talk and play (to type actually).

```javascript
theater.describe("Vader", .8, "#vader");
```

In this example we described a new actor named `"Vader"`, with an experience of `.8` (must be comprised between 0 and 1) and a voice `"#vader"`. Its voice is actually what will be used to print out the speech, for Vader it's an HTML element (through a css selector).

A voice can be of two type: 

* An HTML element (or a css selector string which will result in an HTML element). The element's `innerHTML` is used to set its value.
* A function that will be invoked with four arguments:
  * `newValue` the new speech value
  * `newChar` the new typed character
  * `prevChar` the previous character
  * `speech` the whole speech

**Note:** as for all functions called by TheaterJS, the context (`this`) is set to the current instance.



## Mistakes

An actor has more or less chances to make a mistake depending of its experience.
A mistake result in typing an other character than the real one.
The wrong character is then erased and the correct one typed.

When an actor fixes a mistake, he'll then type x characters without any chance to make a mistake.
For example, if Vader makes a mistake he will fix it and type the 8 next characters perfectly (since he has an experience of `.8`).



## Keyboards & Localization

When making a mistake, a random character near the mistyped one is used instead.
Assuming you are using a `qwerty` keyboard, mistyping a `q` would result in a `a`, `s` or `w`.
If the mistyped character is not mapped in TheaterJS (e.g. `%`), it'll use a random one.

By default, TheaterJS' locale is set to "detect" which means it'll try to get user's language.
Note that if there's no support for user's language, it will fallback to "en".
If you do not want to use the detect feature, you can configure the locale as follows:

```
var theater = new TheaterJS({ locale: "fr" });
```

The main version of TheaterJS includes support for `qwerty` (en) and `azerty` (fr) keyboards.
However, adding support for Russian would be as simple as:

```javascript
TheaterJS.prototype.keyboards.ru = ["йцукенгшщзх", "фывапролджэ", "ячсмитьбюъ"];
```

Available locales can be found in [build/locales](https://github.com/Zhouzi/TheaterJS/tree/gh-pages/build/locales).
If you want to use russian locale, make sure to include the `theater.run.js` or `theater.ru.min.js` file.

```html
<script src="path/to/theater.js"></script>
<script src="path/to/theater.ru.js"></script>
<script>var theater = new TheaterJS({ locale: "ru" });</script>
```

If you are interested in adding support for another language, feel free to [submit an issue](https://github.com/Zhouzi/TheaterJS/issues/new) or a pull request.

### Mapping a new keyboard

A keyboard is mapped based on its physical representation.
For example, below are the implementations of `qwerty` and `azerty`.

```javascript
/*
  [q][w][e][r][t][y][u][i][o][p] // qwertyuiop
  [a][s][d][f][g][h][j][k][l]    // asdfghjkl
  [z][x][c][v][b][n][m]          // zxcvbnm
*/

TheaterJS.prototype.keyboards.en = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];



/*
  [a][z][e][r][t][y][u][i][o][p] // azertyuiop
  [q][s][d][f][g][h][j][k][l][m] // qsdfghjklm
  [w][x][c][v][b][n]             // wxcvbn
*/

TheaterJS.prototype.keyboards.fr = ["azertyuiop", "qsdfghjklm", "wxcvbn"];
```



## Variable speed

As humans, our speed when typing is not linear but more or less variable. Once again, it all depends on our experience. A highly experienced actor will be somewhat constant and fast while a beginner's speed will vary a lot.



## Scenario creation

TheaterJS is actually about writing a scenario.

```javascript
theater
  .write("Vader:I am your father.")
  .write(" For real....")
  .write(-1)
  .write(600)
  .write(function () { /* do something */ });
```

This example showcase 5 of the 6 possible action.
Let's examine it.

**Note:** the `write` method accepts an indefinite number of arguments.

```javascript
theater
  .write("Vader:Hello!")
  .write("How are you doing?");
```

Is equivalent to:

```javascript
theater.write("Vader:Hello!", "How are you doing?");
```

### Set actor & speech

```javascript
theater.write("Vader:I am your father.");
```

The argument passed to the `write` method is a string prefixed by an actor's name.
It actually adds three scenes:

scene name|description
----------|-----------
`actor`|Set the current speaking actor to the passed one.
`erase`|Erase the current speech value.
`say`|Type the speech.

What if you don't set a new speech to replace the current one but want to append a speech instead?

### Append speech value

```javascript
theater.write(" For real...");
```

Here the string is not prefixed by an actor's name and creates only one scene:

scene name|description
----------|-----------
`say`|Type the speech.

### Erase x characters

```javascript
theater.write(-1);
```

When passing a negative number to the `write` method, it will erase x characters of the current speech value.
In this example, it would erase `1` character and Vader's speech would become "For real..." instead of "For real....".

### Wait

```javascript
theater.write(600);
```

Positive numbers create a `wait` scene which makes a break/pause lasting for the amount of the argument (ms).

### Callback

```javascript
theater.write(function () { /* do something */ });
```

Passing a function to `write` creates a `call` scene which calls the function when the scene is played.
Remember, the context is set to the current TheaterJS instance.

### Scene object

In fact, the previous snippets are just shorthands.
The arguments are "parsed" and transformed into scene objects.

```javascript
theater
  .write("Vader:I am your father.")
  .write(" For real....")
  .write(-1)
  .write(600)
  .write(function () { /* do something */ });
```

Is exactly the same as:

```javascript
theater
  .write({ name: "actor", args: ["Vader"] })
  .write({ name: "erase", args: [] })
  .write({ name: "say", args: ["I am your father."] })
  .write({ name: "say", args: [" For real...."] })
  .write({ name: "erase", args: [-1] })
  .write({ name: "wait", args: [600] })
  .write({ name: "call", args: [function () { /* do something */ }] });
```

The scene object has two keys:

* `name` (string): the scene's name is used to call the appropriate method when the scene is played.
* `args` (array): an array of arguments passed to the method.

Using the shorthands are clearly funnier but also limiting.
For example, what if your callback does some asynchronous task?

### Asynchronous callback

Let's say you want to make the screen blink for 2 seconds before calling the next scene.
In this case you'll have to pass `true` as a second argument to the `call` scene.

```javascript
theater.write({ name: "call", args: [blink, true] });
```

When this scene is played, the execution of the scenario will be "paused".
To play the next scene and continue the scenario, you will need to call `this.next()`.

```javascript
function blink () {
  var self = this; // current TheaterJS instance
  
  setTimeout(function () {
    // do something
    return self.next();
  }, 2000);
}
```



## Events

TheaterJS has a built-in event handler.



### Register event

```javascript
  theater
    .on("say:start", function (event, args...) {
      console.log("a say scene started");
    })
    .on("say:end", function (event, args...) {
      console.log("a say scene ended");
    });
```

The value before the `:` is the event's scope while the other part the string is the event itself.
To add a listener on several events, just separate them by a comma:

```javascript
theater
  .on("say:start, erase:start", function (event) {
    // add blinking caret
  })
  .on("say:end, erase:end", function () {
    // remove blinking caret
  });
```

**Note:** use `theater.on("*", function (event, realEvent, args...) {});` if you want to listen to all events.



### Publish event

```javascript
theater
  .emit("scope", "event", ["your", "arguments", "go", "here"])
  .emit("customEvent", ["you might not need the event part"]);
```

The `emit` method accepts up to three arguments. The first being the "scope", the second the event and the third the arguments. If you don't need to specify an event, simply skip it.



# Contributing

TheaterJS' workflow is pretty simple and you're probably already set.

1. Install Node: http://nodejs.org/
2. Install Ruby **if needed**: https://www.ruby-lang.org/en/documentation/installation/
3. Install SASS: http://sass-lang.com/install
4. Install Gulp globally: `npm install --global gulp`

Then, in the forked repository folder, install dependencies `npm install` and you're done!

## Gulp

The `gulpfile.js` comes with 5 tasks:

* `gulp scripts` compiles `src/theater.js`
* `gulp styles` compiles `src/styles.scss`
* `gulp serve` opens a server
* `gulp watch` runs the appropriate tasks when the js or scss file change
* `gulp` runs `scripts` and `styles`

## TODO

- [ ] Add support for html in the speeches `theater.write('Vader: I am your <a href="/father">father</a>.')`
- [ ] Since the `:` character is used as a delimiter, `" I am your father."` in `"Vader:Listen: I am your father."` is ignored. Need to make some test to see if it's worth implementing a way to escape it `\:`. Otherwise, simply build the scene like `{ name: "say", args: ["Listen: I am your father."] }`
- [x] Add support for both azerty and qwerty keyboard in `randomCharNear`, with language detection (`window.navigator.languages || window.navigator.language || window.navigator.userLanguage`)
- [x] The chances to make a mistake on repeated character should be really low.
