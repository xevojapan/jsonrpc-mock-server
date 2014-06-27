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
  lightbox: {
    expand: true,
    cwd: 'bower_components/ekko-lightbox/',
    src: 'ekko-lightbox.min.js',
    dest: '<%= dest.files %>/js/'
  },
  destaque: {
    expand: true,
    cwd: 'bower_components/destaque/',
    src: 'destaque.min.js',
    dest: '<%= dest.files %>/js/'
  },
  ace_builds: {
    expand: true,
    cwd: 'bower_components/ace-builds/src-min-noconflict/',
    src: '*.js',
    dest: '<%= dest.files %>/js/ace/'
  },
  x2js: {
    expand: true,
    cwd: 'bower_components/x2js/',
    src: 'xml2json.min.js',
    dest: '<%= dest.files %>/js/'
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

  deCarta: {
    expand: true,
    cwd: '<%= dest.build %>/',
    src: ['js/decarta.*', 'css/decarta.min.css'],
    dest: '<%= dest.files %>/'
  },

  build: {
    expand: true,
    cwd: '<%= dest.build %>/',
    src: ['js/<%= package.name %>.*', 'js/templates.*'],
    dest: '<%= dest.files %>/'
  }
};

