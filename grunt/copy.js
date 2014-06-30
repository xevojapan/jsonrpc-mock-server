"use strict";

module.exports = {

  jquery: {
    expand: true,
    cwd: 'bower_components/jquery/dist/',
    src: 'jquery.min.js',
    dest: '<%= dest.files %>/js/'
  },
  jquery_ui: {
    expand: true,
    cwd: 'bower_components/jquery-ui/ui/minified/',
    src: 'jquery-ui.min.js',
    dest: '<%= dest.files %>/js/'
  },

  bootstrap: {
    expand: true,
    cwd: 'bower_components/bootstrap/dist/',
    src: ['js/*.min.js', 'css/*.min.css', 'fonts/*'],
    dest: '<%= dest.files %>/'
  },
  ace_builds: {
    expand: true,
    cwd: 'bower_components/ace-builds/src-min-noconflict/',
    src: '*.js',
    dest: '<%= dest.files %>/js/ace/'
  },

  fontawesome: {
    expand: true,
    cwd: 'bower_components/font-awesome/',
    src: ['css/*.min.css', 'fonts/*'],
    dest: '<%= dest.files %>/'
  },

  angular_js: {
    expand: true,
    cwd: '<%= dest.client %>/',
    src: 'angular.min.js',
    dest: '<%= dest.files %>/js/'
  },

  build: {
    expand: true,
    cwd: '<%= dest.build %>/',
    src: ['js/<%= package.name %>.*', 'js/templates.*'],
    dest: '<%= dest.files %>/'
  }
};

