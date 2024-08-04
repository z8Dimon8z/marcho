const { src, dest, watch, parallel, series} = require('gulp');

const scss                = require('gulp-sass')(require('sass'));
const concat              = require('gulp-concat');
const autoprefixer        = require('gulp-autoprefixer');
const uglify              = require('gulp-uglify');
const imagemin            = require('gulp-imagemin');
const rename              = require('gulp-rename');
const nunjucksrender      = require('gulp-nunjucks-render');
const del                 = require('del');
const browserSync         = require('browser-sync').create();


function nunjucks(){
  return src('app/html/*.njk')
    .pipe(nunjucksrender())
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}

//конвертируем и сжимаем файлы из папки scss в папку css
function styles () {
  return src('app/scss/*.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    // .pipe(concat())
    .pipe(rename({
      suffix : '.min',
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

//компиляция скриптов js
function scripts () {
  return src([
    'node_modules/jquery/dist/jquery.js',  //плагины jqery
    'node_modules/slick-carousel/slick/slick.js',  //плагины slick
    'node_modules/rateyo/src/jquery.rateyo.js',  //плагины rateyo
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',  //плагины fancybox
    'node_modules/ion-rangeslider/js/ion.rangeSlider.js',  //плагины Range Slider
    'node_modules/jquery-form-styler/dist/jquery.formstyler.js',  //плагины form stiler
    'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

//сжатие изображений
function images () {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
	    imagemin.mozjpeg({quality: 75, progressive: true}),
	    imagemin.optipng({optimizationLevel: 5}),
	    imagemin.svgo({
		    plugins: [
			    {removeViewBox: true},
		    	{cleanupIDs: false}
		]
	})
    ]))
    .pipe(dest('dist/images'))
}

//сервер
function browsersync() {
  browserSync.init({
    server: {
        baseDir: "app/"
    },
    notify: false
  });
}

//слежение за проектом
function watching () {
  watch(['app/**/*.scss'], styles);
  watch(['app/html/*.njk'], nunjucks);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

function cleanDist () {
  return del('dist')
}

function build () {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
  ], {base: 'app'})
  .pipe(dest('dist'))
}


exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.nunjucks = nunjucks;


exports.build = series(cleanDist, images, build);
exports.default = parallel(nunjucks, styles, scripts, browsersync, watching);
