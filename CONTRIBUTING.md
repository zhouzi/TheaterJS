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

## Add a new locale to TheaterJS

To add support for a new locale/keyboard, fork this repository.
Then create a new file named from the locale's short name in `src/locales`.
Your implementation goes in a file named `theater.<locale>.js`.
Call `gulp` so it create the proper files in the `/build` folder.

Copy an existing demo in the `/locales` folder and paste it in a new one.
Include the new locale, modify the `new TheaterJS({ locale: '...' })` to be configured properly.

### Example

Let's say we want to implement the locale for german keyboards, `"de"`.

1. Create `/src/locales/theater.de.js` with the new keyboard implementation
2. Call `gulp`
3. Create `/locales/de/index.html`
4. In this file, include `<script src="../../build/locales/theater.de.min.js"></script>` and update TheaterJS instantiation: `var theater = new TheaterJS({ locale: "de" });`
6. Submit a pull request

Note: It'd be much appreciated if you could translate the demo dialogue also.

## TODO

- [ ] Make some browser tests, support table
- [ ] Improve mistakes by adding other types, see [#16](https://github.com/Zhouzi/TheaterJS/issues/16)
- [ ] Find a way to avoid duplicating the index file for each locale's demo `locales/`
