# Installation

1. `npm install`

## Scripts

- `lint`: lint the files.
- `test`: run the tests.
- `build`: transpile the files to ES5.

## Adding a keyboard

The keyboards are implemented in `src/keyboards.json`.
A mapped keyboard is just a list of characters, ordered after their "physical" equivalent.
So for example, the english keyboard (aka `qwerty`) looks like this:

```javascript
["qwertyuiop", "asdfghjkl", "zxcvbnm"];
```
