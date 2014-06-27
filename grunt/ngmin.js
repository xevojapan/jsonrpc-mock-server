"use strict";

module.exports = {

  build: {
    src: '<%= dest.client %>/app.js',
    dest: '<%= dest.client %>/<%= package.name %>.js'
  }

};

