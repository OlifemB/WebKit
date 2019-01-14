import {src, dest, watch, parallel, series} from "gulp";
import browserSync from "browser-sync";
import ejs from "gulp-ejs";
import postcss from "gulp-postcss";
import svgSprite from "gulp-svg-sprite";
import svgo from "gulp-svgo";
import imageMin from "gulp-imageMin";
import webpackStream from "webpack-stream";

// Server
const server = browserSync.create();

const serverTask = done => {
  server.init({
    server: {
      baseDir: "./dist"
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

watch("src/**/*.ejs", series(templates));

// Styles
const styles = () =>
  src("src/styles/*.css")
    .pipe(postcss())
    .pipe(dest("dist/styles"))
    .pipe(server.stream());

watch("src/**/*.css", styles);

// Fonts
const fonts = () =>
  src("src/fonts/**/*")
    .pipe(dest("dist/fonts"));

watch("src/fonts/**/*", fonts);

// SVG minification to use them inline or <img /> tag.
const svgoTask = () =>
  src("src/images/svgo/**/*.svg")
    .pipe(svgo())
    .pipe(dest("dist/images/svg"));

watch("src/images/svgo/**/*.svg", svgoTask);

// SVG sprite
const svgSpriteTask = () =>
  src("src/images/svg-sprites/**/*.svg")
    .pipe(
      svgSprite({
        dest: ".",
        mode: {
          symbol: {
            dest: "."
          }
        }
      })
    )
    .pipe(
      svgo({
        js2svg: {
          pretty: true
        },
        plugins: [{cleanupIDs: false}]
      })
    )
    .pipe(dest("dist/images"));

watch("src/images/svg-sprites/**/*.svg", svgSpriteTask);

const imageminTask = () =>
  src("src/images/**/*.*")
    .pipe(imageMin())
    .pipe(dest("dist/images"));

watch("src/images/**/*", imageminTask);

const images = () =>
  src("src/images/**/*.*")
    .pipe(dest("dist/images"));

watch("src/images/**/*", images);

const scripts = () =>
  src(["src/scripts/**/*.js"],["!src/scripts/mainBoundle.js"])
    .pipe(dest("dist/scripts/"));

watch("src/scripts/**/*.js", scripts);

const favicon = () =>
  src("src/images/favicon/*")
    .pipe(dest("dist/favicon"));

const webpack = (cb) => {
  const webpackConfig = {
    mode: 'development',
    watch: true,
    output: {
      filename: "mainBoundle.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader"
        }
      ]
    }
  };

  src("src/scripts/mainBoundle.js")
    .pipe(webpackStream(webpackConfig))
    .pipe(dest("dist/scripts"))
    .pipe(server.stream());

  cb();
};

export default series(
  parallel(
    templates,
    styles,
    scripts,
    fonts,
    //svgoTask,
    //svgSpriteTask,
    //imageminTask,
    images,
    favicon,
    webpack
  ),
  serverTask
);
