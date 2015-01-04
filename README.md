# TheaterJS

TheaterJS is basically a javascript typing effect plugin.
Its particularity is to mimic human behavior.
But what's different between a robot and a human typing then?

* We make mistakes.
* We're not that fast and our speed is variable.
* Those traits are based on our experience.

TheaterJS is also built on top of:

* Powerful and simple scenario creation.
* Multiple actors management (each one having its very own characteristics).
* Chainable methods.
* Event handling.

Have a look at the commented and editable demo on [codepen](http://codepen.io/Zhouzi/pen/JoRazP?editors=001) or the [TheaterJS page](http://gabinaureche.com/TheaterJS). I also plan to write an article soon so stay tuned!



## Example

```
  var theater = new TheaterJS();
  
  theater
    .describe("Vader", .8, "#vader")
    .describe("Luke", .6, "#luke");
    
  theater
    .write("Vader:Luke.", 600)
    .write("Luke:What?", 400)
    .write("Vader:I am...", 400, " your father.");
    
  theater
    .on("say:start, erase:start", function () { /* do something when say or erase starts */ })
    .on("say:end, erase:end", function () { /* do something when say or erase ends */ })
    .on("*", function () { /* called whenever an event is triggered */ });
```



## Documentation

### `describe`

##### Arguments

1. name (string): actor's name. e.g.: `Vader:I am your father.` would be a reference to the actor named "Vader".
2. experience (float int - optional): set the actor's experience, between 0 to 1. Default value is `.6`
3. voice (function, string or HTMLElement - optional): voice is used to set the actor's speech. Default value is a function logging the new value to the console.

If actor's `voice` is a function, it'd be called with 4 arguments:

1. newValue: the new value of actor's speech.
2. newChar: the new character.
3. prevChar: the previous character.
4. speech: the complete string being typed.

**Note:** as all function called by TheaterJS, the voice's context is set to the current TheaterJS instance.



### `write`

Accepts an indefinite number of parameters. There's 5 *"types"* accepted:

* string: a speech to type. If the string contains an actor's name (e.g.: `"Vader:I am your father."`), it also add a scene to update the current actor. When omitting the actor's name, the value will be appended instead of replaced.
* positive integer: create a break scene lasting for the amout of the argument (ms).
* negative integer: e.g.: `-3` erase `3` characters.
* function: a function to call when the scene is executed (context is set to the current TheaterJS instance). If the function has some asynchrone tasks, you'll need to pass true as second argument. To do so, build a scene: `theater.write({ name: "call", args: [function () { return this.next(); }, true] });`. Don't forget to call `this.next()` when you are ready to get the next scene.
* object: a scene object with two keys: `name` and `args`. e.g.: `theater.write({ name: "say", args: ["Hello!"] });`

### events

TheaterJS has a built-in event handler. To register an event:

```
  theater
    .on("say:start", function (eventName, args...) { console.log("a say scene started"); })
    .on("say:end", function (eventName, args...) { console.log("a say scene ended); });
```

The value before `:` is the scene's name (scope) while the other part of the string is the event itself.

**Note:** use `theater.on("*", function (eventName, realEventName, args...) {});` if you want to listen to all events.

The `emit` method accepts up to three arguments. The first being the "scope", the second the event and the third the arguments.

```
  theater
    .emit("myevent", "start", ["your", "arguments", "go", "here"])
    .emit("myevent", ["you might not need the event part"]);
```
