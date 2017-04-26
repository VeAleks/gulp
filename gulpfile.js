var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var csscomb = require('gulp-csscomb');
var mmq = require('gulp-merge-media-queries');
var clean = require('gulp-clean');
var autoprefixer = require('autoprefixer');



var mainFile = 'main.scss';

var paths = {
  map: '../css',
  css: 'css/',
  img: 'images/',
  scss: 'scss/',
  js: 'js/',
  sourceimage: 'sourceimages/'
};

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./",
            index: "index.html",
            directory: true
        }
    });
});

gulp.task('imgmin', function() {
  return gulp.src(paths.sourceimage + '**/*')
  .pipe(newer(paths.img))
  .pipe(imagemin([
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo({plugins: [{removeViewBox: true}]})
  ], {
    verbose: true
  }))
  .pipe(gulp.dest(paths.img));
});

gulp.task('sass', function () {
  return gulp.src(paths.scss + mainFile)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
    .pipe(sourcemaps.write(paths.map))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('clean', function() {
  return gulp.src(paths.css).pipe(clean({force: true}));
});

gulp.task('restoreSass', ['clean'], function () {
  return gulp.src(paths.scss + '*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.css));
});

gulp.task('beauty', ['restoreSass'],  function() {
  return gulp.src(paths.css + '**/*.css')
    .pipe(mmq())
    .pipe(csscomb())
    .pipe(gulp.dest(paths.css));
});

gulp.task('prefixer', function() {
    gulp.src(paths.css + '**/*.css')
        
        .pipe(gulp.dest(paths.css))
});

gulp.task('watch', function() {
  gulp.watch(paths.scss + '**/*.scss', ['sass']);
  gulp.watch('*.html', browserSync.reload);
  gulp.watch(paths.js + '**/*.js', browserSync.reload);
  gulp.watch(paths.sourceimage + '**/*', ['imgmin']);
});

// run task
gulp.task('default', ['browser-sync',  'watch']);

// dist  task
gulp.task('dist', ['beauty', 'imgmin']);