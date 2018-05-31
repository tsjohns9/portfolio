const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const concatCss = require('gulp-concat-css');
const order = require('gulp-order');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const pkg = require('./package.json');
const browserSync = require('browser-sync').create();

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function() {
  // Bootstrap
  gulp
    .src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./public/vendor/bootstrap'));

  // Devicons
  gulp
    .src([
      './node_modules/devicons/**/*',
      '!./node_modules/devicons/*.json',
      '!./node_modules/devicons/*.md',
      '!./node_modules/devicons/!PNG',
      '!./node_modules/devicons/!PNG/**/*',
      '!./node_modules/devicons/!SVG',
      '!./node_modules/devicons/!SVG/**/*'
    ])
    .pipe(gulp.dest('./vendor/devicons'));

  // Font Awesome
  gulp
    .src([
      './node_modules/font-awesome/**/*',
      '!./node_modules/font-awesome/{less,less/*}',
      '!./node_modules/font-awesome/{scss,scss/*}',
      '!./node_modules/font-awesome/.*',
      '!./node_modules/font-awesome/*.{txt,json,md}'
    ])
    .pipe(gulp.dest('./vendor/font-awesome'));

  // jQuery
  gulp
    .src(['./node_modules/jquery/dist/*', '!./node_modules/jquery/dist/core.js'])
    .pipe(gulp.dest('./vendor/jquery'));

  // jQuery Easing
  gulp.src(['./node_modules/jquery.easing/*.js']).pipe(gulp.dest('./vendor/jquery-easing'));

  // Simple Line Icons
  gulp
    .src(['./node_modules/simple-line-icons/fonts/**'])
    .pipe(gulp.dest('./vendor/simple-line-icons/fonts'));

  gulp
    .src(['./node_modules/simple-line-icons/css/**'])
    .pipe(gulp.dest('./vendor/simple-line-icons/css'));
});

// move main jquery and bootstrap to public
gulp.task('move', ['vendor'], function() {
  gulp.src(['./public/vendor/bootstrap/css/bootstrap.css']).pipe(gulp.dest('./public/css'));
  gulp.src(['./public/vendor/bootstrap/js/bootstrap.bundle.js']).pipe(gulp.dest('./public/js'));
  gulp.src(['./public/vendor/jquery/jquery.js']).pipe(gulp.dest('./public/js'));
  gulp.src(['./public/vendor/jquery-easing/jquery.easing.js']).pipe(gulp.dest('./public/js'));
});

// Compile SCSS
gulp.task('css:compile', function() {
  return gulp
    .src('./public/scss/**/*.scss')
    .pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
  return gulp
    .src(['./public/css/*.css', '!./css/*.min.css'])
    .pipe(concat('main.css'))
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function() {
  return gulp
    .src(['./public/js/*.js', '!./js/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(order(['jquery.js', 'bootstrap.bundle.js', 'jquery.easing.js', 'resume.js']))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

// Default task
gulp.task('default', ['move', 'css', 'js']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({ server: { baseDir: './' } });
});

// Dev task
gulp.task('dev', ['css', 'js', 'browserSync'], function() {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./*.html', browserSync.reload);
});
