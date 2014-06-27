"use strict";

module.exports = {

  server: {
    src: '<%= src.server %>/app.ts',
    dest: '<%= dest.server %>',
    options: {
      target: 'ES5',
      module: 'commonjs',
      basePath: '<%= src.server %>',
      sourceMap: true,
      disallowAsi: false,
      declaration: true,
      noImplicitAny: true
    }
  },
  client: {
    src: [ '<%= src.client %>/**/*.ts' ],
    dest: '<%= dest.client %>/app.js',
    options: {
      target: 'ES5',
      module: 'amd',
      basePath: '<%= src.client %>',
      disallowAsi: false,
      declaration: false,
      noImplicitAny: true
    }
  },
  test: {
    src: '<%= src.test %>',
    dest: '<%= dest.test %>',
    options: {
      target: 'ES5',
      module: 'commonjs',
      basePath: 'test',
      sourceMap: true
    }
  }

};

