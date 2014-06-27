"use strict";

module.exports = {

  build: {
    src: [
      '<%= dest.server %>',
      '<%= dest.client %>',
      '<%= dest.test %>/**/*.js',
      '<%= dest.build %>/**/*',
      '<%= dest.files %>/css/',
      '<%= dest.files %>/js/'
    ]
  }

};

