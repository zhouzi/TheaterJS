# TheaterJS

TheaterJS is basically a javascript typing effect plugin without any dependencies. 
The purpose of this library is to mimic a human behavior. Core principles are:

* Powerful and simple scenario creation
* Mistakes
* Experience (how good the actor is)
* Variable "typing" speed
* Multiple actors
* Chainable methods

## Links

* [Editable demo on codepen](http://codepen.io/Zhouzi/pen/JoRazP?editors=001)
* [Repo's demo](http://gabinaureche.com/TheaterJS) (same as the codepen)
* Article *(coming soon)*

## Quick look

First, create a new TheaterJS instance.

```
  var theater = new TheaterJS();
```

Then, describe some actors:

```
  theater
    .describe("Vader", .8, "#vader")
    .describe("Luke", .6, "#luke");
```

Now, write the scenario:

```
  theater
    .write("Vader:Luke.", 400)
    .write("Luke:What?", 400)
    .write("Vader:I am... ", 400, "Your father...");
```

**Note:** the `write` method accepts an indefinite number of parameters so you could even write:

```
  theater.write("Vader:Luke", 400, "Luke:What?", 400, "Vader:I am... ", 400, "Your father...");
```

Or:

```
  theater
    .write("Vader:Luke")
    .write(400)
    .write("Luke:What?")
    .write(400)
    .write("Vader:I am... ", 400, "Your father...");
```

They are all equivalent.
