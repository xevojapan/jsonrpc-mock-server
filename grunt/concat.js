"use strict";

module.exports = {

  angular: {
    src: [
      'bower_components/angular/angular.min.js',
      'bower_components/angular-animate/*.min.js',
      'bower_components/angular-resource/*.min.js',
      'bower_components/angular-route/*.min.js',
      'bower_components/angular-translate/*.min.js',
      'bower_components/angular-translate-loader-static-files/*.min.js',
      'bower_components/angular-bootstrap/*-tpls.min.js',
      'bower_components/angular-ui-utils/*.min.js',
      'bower_components/angular-ui-map/*.min.js',
      'bower_components/angular-ui-sortable/*.min.js',
      'bower_components/angular-ui-ace/*.min.js',
      'bower_components/angular-smoothscroll/dist/scripts/*.js'
    ],
    dest: '<%= dest.client %>/angular.min.js'
  },

  destaque: {
    src: [ 'bower_components/destaque/src/*.js' ],
    dest: 'bower_components/destaque/destaque.js'
  },

  decarta_css: {
    src: [
      '<%= src.deCarta %>/css/core.css',
      '<%= src.deCarta %>/css/UI/LayerControl.css', '<%= src.deCarta %>/css/UI/ScaleControl.css', '<%= src.deCarta %>/css/UI/ZoomControl.css'
    ],
    dest: '<%= dest.build %>/css/decarta.css'
  },
  decarta_js: {
    src: [
      '<%= src.deCarta %>/deCarta.JS4.js', '<%= src.deCarta %>/Config.js',
      '<%= src.deCarta %>/js/UI/LayerControl.js', '<%= src.deCarta %>/js/UI/ScaleControl.js', '<%= src.deCarta %>/js/UI/ZoomControl.js'
    ],
    dest: '<%= dest.client %>/decarta.js'
  },

  drivelytics: {
    src: [ '<%= dest.client %>/app.js', '<%= src.client %>/controllers/hist/*.js' ],
    dest: '<%= dest.client %>/app.js'
  }

};

