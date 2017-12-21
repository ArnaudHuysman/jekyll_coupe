

var gulp          = require('gulp');
var browserSync   = require('browser-sync').create();
var gulpImgResize = require('gulp-image-resize');
var cp            = require('child_process');
var sass          = require('gulp-sass');
var postcss       = require('gulp-postcss');
var autoprefixer  = require('autoprefixer');
var cssnano       = require('cssnano');
var rename        = require('gulp-rename');
var sourcemaps    = require('gulp-sourcemaps');
var uglify        = require('gulp-uglify');
var plumber       = require('gulp-plumber');
var webpack       = require('webpack');
var webpackStream = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');




//BrowserSync

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './_site/'
        },
        browser: "google chrome"
    })
});


// Images

gulp.task('images:work', function(){
  return gulp.src('./assets/img/works/**/*')
    .pipe(gulpImgResize({
      width: 1500,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(gulp.dest('./_site/assets/img/works/_1500/'))
    .pipe(gulpImgResize({
      width: 1024,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(gulp.dest('./_site/assets/img/works/_1024/'))
    .pipe(gulpImgResize({
      width: 800,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(gulp.dest('./_site/assets/img/works/_800/'))
});


//css

gulp.task('build:css', function(){
  return gulp.src('./assets/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'} ))
    .pipe(gulp.dest('./_site/assets/css/'))
    .pipe(rename( { suffix: '.min'} ))
    .pipe(postcss( [autoprefixer(), cssnano()] ))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./_site/assets/css/'))
    .pipe(browserSync.stream());
});


//JS

gulp.task('build:js', function(){
  return gulp.src('./assets/js/main.js')
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('./_site/assets/js/'))
    .pipe(rename( {suffix: '.min'} ))
    .pipe(uglify())
    .pipe(gulp.dest('./_site/assets/js/'))
    .pipe(browserSync.stream());
});


//Jekyll

gulp.task('build:jekyll', function(done){
  return cp.spawn('bundle', ['exec', 'jekyll', 'build'], { stdio: 'inherit' })
    .on('close', done);
});

gulp.task('rebuild:jekyll',['build:jekyll'], function(){
  browserSync.reload()
});


//Build

gulp.task('build', ['build:jekyll', 'build:js', 'build:css', 'images:work']);

//Watch

gulp.task('watch',['browserSync'], function(){
  gulp.watch([
    '_data/**/*',
    '_includes/**/*',
    '_layouts/**/*',
    '_pages/**/*',
    '_works/**/*',
    '_posts/**/*'
  ], ['rebuild:jekyll']);
  gulp.watch(['assets/scss/**/*'], ['build:css']);
  gulp.watch(['assets/js/**/*'], ['build:js']);
})
