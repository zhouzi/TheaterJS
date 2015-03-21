var gulp    = require("gulp"),
    plugins = require("gulp-load-plugins")();

gulp.task("scripts", function () {
    return gulp
        .src("src/**/*.js")
        .pipe(gulp.dest("build"))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({ suffix: ".min" }))
        .pipe(gulp.dest("build"));
});

gulp.task("styles", function () {
    return gulp
      .src("src/styles.scss")
      .pipe(plugins.rubySass({ style: "compressed", "sourcemap=none": true }))
      .pipe(plugins.autoprefixer("last 3 version"))
      .pipe(gulp.dest("build"));
});

gulp.task("coverage", function () { return gulp.src("test/coverage/*/index.html").pipe(plugins.open('<%file.path%>')); });
gulp.task("serve", ["default"], function () { gulp.src("").pipe(plugins.webserver()); });
gulp.task("watch", ["default"], function () { gulp.watch("src/**/*.js", ["scripts"]); gulp.watch("src/styles.scss", ["styles"]) });
gulp.task("default", ["scripts", "styles"]);