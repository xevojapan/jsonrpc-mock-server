"use strict";

module.exports = {

  angular: {
    src: [
      'bower_components/angular/angular.min.js',
      'bower_components/angular-animate/*.min.js',
      'bower_components/angular-resource/*.min.js',
      'bower_components/angular-route/*.min.js',
      'bower_components/angular-bootstrap/*-tpls.min.js',
      'bower_components/angular-ui-utils/*.min.js',
      'bower_components/angular-ui-router/release/*.min.js',
      'bower_components/angular-ui-ace/*.min.js'
    ],
    dest: '<%= dest.client %>/angular.min.js'
  }

};

