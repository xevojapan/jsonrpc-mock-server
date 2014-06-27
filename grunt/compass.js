"use strict";

module.exports = {

  build: {
    options: {
      config: '<%= compass.config %>',
      require: ['compass-import-once']
    }
  },
  min: {
    options: {
      config: '<%= compass.config %>',
      force: true,
      require: ['compass-import-once'],
      outputStyle: 'compressed',
      environment: 'production'
    }
  }

};

