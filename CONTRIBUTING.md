# Setup

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

1. Fork this repository
2. Create the file `src/locales/theater.<locale>.js` (e.g `/src/locales/theater.de.js` for the `"de"` locale)
3. Use `gulp` to create the proper files in the `/build` folder
4. Submit a pull request

### How it works

Mapping a keyboard is quite easy, for example here is the pysical representation of an `azerty` keyboard:

```
[a][z][e][r][t][y][u][i][o][p]
[q][s][d][f][g][h][j][k][l][m]
[w][x][c][v][b][n]
```

So adding support for the `fr` locale (`azerty` keyboard) would be as simple as creating the following file in `src/locales/theater.fr.js`.

```javascript
(function (w) {
    w.TheaterJS.prototype.keyboards.fr = ["azertyuiop", "qsdfghjklm", "wxcvbn"];
})(window);
```