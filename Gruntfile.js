"use strict";

module.exports = function (grunt) {
  require('load-grunt-config')(grunt, {
    data: {
      compass: {
        config: 'config.rb'
      },
      src: {
        css: 'public/css',
        server: 'src/server',
        client: 'src/client',
        test: [ 'test/**/*.ts' ]
      },
      dest: {
        server: 'lib/server',
        client: 'build/js',
        test: 'test',
        build: 'build',
        files: 'public'
      }
    }
  });
};

