# Setup

Fork the repository, clone it then:

1. `cd TheaterJS`
2. `npm install`

# Tasks

TheaterJS' build workflow is based on npm scripts and webpack:

* `npm run build` - build the dist version of TheaterJS.
* `npm run dev` - watch for changes and build the dist version when needed.
* `npm run lint` - lint js files using [standard](http://standardjs.com/).
* `npm run test` - run the tests.

Note: there's a git pre-commit hook that's going to run the tests when using `git commit`.

# Adding a keyboard

The keyboards are implemented in `src/keyboards.json`.
A mapped keyboard is just a list of characters, ordered after their "physical" equivalent.
So for example, the english keyboard (aka `qwerty`) looks like this:

```javascript
[
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm"
]
```
