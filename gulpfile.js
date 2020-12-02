const gulp = require('gulp'),
  serve = require('browser-sync'),
  sass = require('gulp-sass'),
  maps = require('gulp-sourcemaps'),
  webpack = require('webpack-stream'),
  responsive = require('gulp-responsive'),
  rename = require('gulp-rename'),
  cache = require('gulp-cached'),
  htmlmin = require('gulp-htmlmin'),
  gulpif = require('gulp-if');

sass.compile = require('node-sass'); 

const isBuild = true,
  config = {};

config.mode = isBuild ? 'production' : 'development';
config.devtool = isBuild ? 'none' : 'eval-source-map';


gulp.task('serve', async function() {
  serve.init({
    server: {
      baseDir: './dist'
    }
  });
});

gulp.task('html', async function() {
  gulp.src('./app/index.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', async function() {
  gulp.src('./app/sass/**/*.scss')
    .pipe(gulpif(!isBuild, maps.init()))
    .pipe(sass({ outputStyle: 'compressed' }))
    .on('error', function(error) {
      serve.notify(error.message, 5000);
      this.emit('end');
    })
    .pipe(gulpif(!isBuild, maps.write()))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(serve.stream());
});

gulp.task('js', async function() {
  gulp.src('./app/index.js')
    .pipe(webpack({
      mode: config.mode,
      devtool: config.devtool,
      output: {
        filename: 'bundle.js'
      }
    }))
    .on('error', function() {
      this.emit('end');
    })
    .pipe(gulp.dest('./dist'))
});

gulp.task('font', async function() {
  gulp.src('./app/blocks/icon/font/*.woff{,2}')
    .pipe(gulp.dest('./dist/font'));
});

gulp.task('image', async function() {
  gulp.src('./app/imgs/fullwidth/*.jpg')
    .pipe(cache('image'))
    .pipe(responsive({
      '*.jpg': [{
        width: 450,
        rename: { suffix: '-s' }
      }, {
        width: 640,
        rename: { suffix: '-m' }
      }, {
        width: 1000,
        rename: { suffix: '-l' }
      }, {
        width: 1600,
        rename: { suffix: '-xl' }
      }]
    }, {
      quality: 70,
      progressive: true,
      withMetadata: false
    }))
    .on('error', function(error) {
      console.log(error.message);
      this.emit('end');
    })
    .pipe(gulp.dest('./dist/imgs/fullwidth'));

  gulp.src('./app/imgs/gallery/*.jpg')
    .pipe(cache('image'))
    .pipe(responsive({
      '*.jpg': [{
        width: 450,
        rename: { suffix: '-s' }
      }, {
        width: 640,
        rename: { suffix: '-m' }
      }]
    }, {
      quality: 70,
      progressive: true,
      withMetadata: false
    }))
    .on('error', function(error) {
      console.log(error.message);
      this.emit('end');
    })
    .pipe(gulp.dest('./dist/imgs/gallery'));

  gulp.src('./app/imgs/avatar/*.jpg')
    .pipe(cache('image'))
    .pipe(responsive({
      '*.jpg': [{
        width: 60,
        rename: { suffix: '-s' }
      }, {
        width: 120,
        rename: { suffix: '-m' }
      }]
    }, {
      quality: 70,
      progressive: true,
      withMetadata: false
    }))
    .on('error', function(error) {
      console.log(error.message);
      this.emit('end');
    })
    .pipe(gulp.dest('./dist/imgs/avatar'));
});

gulp.task('watch', async function() {
  gulp.watch('./app/index.html').on('change', gulp.series('html', serve.reload));
  gulp.watch('./app/(blocks|sass)/**/*.scss').on('change', gulp.series('sass'));
  gulp.watch('./app/**/*.js').on('change', gulp.series('js', serve.reload));
    gulp.watch('.app/**/*.jpg').on('add', gulp.series('image', serve.reload));
});

gulp.task('default', gulp.series(
  'html',
  'sass',
  'js',
  'font',
  'image',
  'watch',
  'serve'
));