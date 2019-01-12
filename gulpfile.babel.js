import {src, dest, watch, parallel, series} from "gulp";
import browserSync from "browser-sync";
import ejs from "gulp-ejs";
import postcss from "gulp-postcss";
import svgSprite from "gulp-svg-sprite";
import svgo from "gulp-svgo";
import imageMin from "gulp-imagemin";

// Server
const server = browserSync.create();

const serverTask = (done) => {
  server.init({
    server: {
      baseDir: './dist'
    }
  });
  done();
};

// Templates
const templates = () =>
  src("src/*.ejs")
    .pipe(ejs({}, {}, {ext: ".html"}))
    .pipe(dest("dist"))
    .pipe(server.stream());

watch('src/**/*.ejs', series(templates));

// Styles
const styles = () =>
  src("src/styles/*.css")
    .pipe(postcss())
    .pipe(dest("dist/styles"))
    .pipe(server.stream());

watch('src/**/*.css', styles);

// Styles
const scripts = () =>
  src("src/scripts/*.js")
    .pipe(dest("dist/scripts"))
    .pipe(server.stream());

watch('src/**/*.js', scripts);

// Fonts
const fonts = () =>
  src('src/fonts/**/*')
    .pipe(dest('dist/fonts'));

watch('src/fonts/**/*', fonts);

// SVG minification to use them inline or <img /> tag.
const svgoTask = () =>
  src("src/images/svgo/**/*.svg")
    .pipe(svgo())
    .pipe(dest("dist/images/svg"));

watch("src/images/svgo/**/*.svg", svgoTask);

// SVG sprite
const svgSpriteTask = () =>
  src("src/images/svg-sprites/**/*.svg")
    .pipe(svgSprite({
      dest: ".",
      mode: {
        symbol: {
          dest: '.'
        }
      }
    }))
    .pipe(svgo({
      js2svg: {
        pretty: true
      },
      plugins: [
        {cleanupIDs: false},
      ]
    }))
    .pipe(dest('dist/images'));

watch("src/images/svg-sprites/**/*.svg", svgSpriteTask);

const imageminTask = () =>
  src("src/images/imagemin/*")
    .pipe(imageMin())
    .pipe(dest("dist/images/raster"));

export default series(parallel(templates, styles, scripts, fonts, svgoTask, svgSpriteTask, imageminTask), serverTask);