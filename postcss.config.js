module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-preset-env": {
      stage: 0
    },
    "postcss-nested": {},
    "postcss-pseudo-class-enter": {},
    autoprefixer: {
      browsers: ['last 4 version']
    },
    cssnano: {}
  }
};