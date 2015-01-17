var gulp    = require("gulp"),
    plugins = require("gulp-load-plugins")();

gulp.task("scripts", function () {
    gulp
        .src("src/theater.js")
        .pipe(gulp.dest("build"))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({ suffix: ".min" }))
        .pipe(gulp.dest("build"));

    gulp
        .src("src/locales/*.js")
        .pipe(gulp.dest("build/locales"))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({ suffix: ".min" }))
        .pipe(gulp.dest("build/locales"));
});

gulp.task("styles", function () {
    gulp
      .src("src/styles.scss")
      .pipe(plugins.rubySass({ style: "compressed", "sourcemap=none": true }))
      .pipe(plugins.autoprefixer("last 3 version"))
      .pipe(gulp.dest("build"));
});

gulp.task("serve", ["default"], function () { gulp.src("").pipe(plugins.webserver()); });
gulp.task("watch", ["default"], function () { gulp.watch("src/**/*.js", ["scripts"]); gulp.watch("src/styles.scss", ["styles"]) });
gulp.task("default", ["scripts", "styles"]);