"use strict";

module.exports = {

  options: {
    require: ['intelli-espower-loader'],
    files: '<%= dest.test %>/**/*.js',
    recursive: true,
  },
  tap: {
    options: {
      reporter: 'tap'
    }
  }

};

