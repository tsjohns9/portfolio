const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const dartSass = require('sass');
const gulpSass = require('gulp-sass');
const sass = gulpSass(dartSass);
const concat = require('gulp-concat');
const order = require('gulp-order');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function () {
	// Bootstrap
	gulp
		.src([
			'./node_modules/bootstrap/dist/**/*',
			'!./node_modules/bootstrap/dist/css/bootstrap-grid*',
			'!./node_modules/bootstrap/dist/css/bootstrap-reboot*',
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
			'!./node_modules/devicons/!SVG/**/*',
		])
		.pipe(gulp.dest('./public/vendor/devicons'));

	// Font Awesome
	gulp
		.src([
			'./node_modules/font-awesome/**/*',
			'!./node_modules/font-awesome/{less,less/*}',
			'!./node_modules/font-awesome/{scss,scss/*}',
			'!./node_modules/font-awesome/.*',
			'!./node_modules/font-awesome/*.{txt,json,md}',
		])
		.pipe(gulp.dest('./public/vendor/font-awesome'));

	// jQuery
	gulp
		.src(['./node_modules/jquery/dist/*', '!./node_modules/jquery/dist/core.js'])
		.pipe(gulp.dest('./public/vendor/jquery'));

	// jQuery Easing
	gulp.src(['./node_modules/jquery.easing/*.js']).pipe(gulp.dest('./public/vendor/jquery-easing'));

	// Simple Line Icons
	gulp
		.src(['./node_modules/simple-line-icons/fonts/**'])
		.pipe(gulp.dest('./public/vendor/simple-line-icons/fonts'));

	gulp
		.src(['./node_modules/simple-line-icons/css/**'])
		.pipe(gulp.dest('./public/vendor/simple-line-icons/css'));
});

// move main jquery and bootstrap to public
gulp.task('move', gulp.series('vendor'), function () {
	return gulp.parallel(
		function () {
			return gulp
				.src(['./public/vendor/bootstrap/css/bootstrap.css'])
				.pipe(gulp.dest('./public/css'));
		},
		function () {
			return gulp
				.src(['./public/vendor/bootstrap/js/bootstrap.bundle.js'])
				.pipe(gulp.dest('./public/js'));
		},
		function () {
			return gulp.src(['./public/vendor/jquery/jquery.js']).pipe(gulp.dest('./public/js'));
		},
		function () {
			return gulp
				.src(['./public/vendor/jquery-easing/jquery.easing.js'])
				.pipe(gulp.dest('./public/js'));
		}
	);
});

// Compile SCSS
gulp.task('css:compile', function () {
	return gulp
		.src('./public/scss/*.scss')
		.pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
		.pipe(gulp.dest('./public/css'));
});

// Minify CSS
gulp.task('css:minify', gulp.series('css:compile'), function () {
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
gulp.task('css', gulp.series('css:minify'));

// Minify JavaScript
gulp.task('js:minify', function () {
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
gulp.task('js', gulp.series('js:minify'));

// Default task
gulp.task('default', gulp.series('move', 'css', 'js'));

// Configure the browserSync task
gulp.task('browserSync', function () {
	browserSync.init({ server: { baseDir: './' } });
});

// Dev task
gulp.task('dev', gulp.series('css', 'js', 'browserSync'), function () {
	return gulp.parallel(
		function () {
			return gulp.watch('./public/scss/*.scss', ['css']);
		},
		function () {
			return gulp.watch('./public/js/*.js', ['js']);
		},
		function () {
			return gulp.watch('index.html', browserSync.reload);
		}
	);
});
