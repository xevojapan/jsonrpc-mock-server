"use strict";

module.exports = {

  tsc_server: {
    files: [ '<%= src.server %>/**/*.ts', '!**/*.d.ts', ],
    tasks: [ 'typescript:server', 'env:test', 'mochacli' ]
  },
  tsc_client: {
    files: [ '<%= src.client %>/**/*.ts', '!**/*.d.ts', ],
    tasks: [ 'typescript:client', 'angular', 'uglify', 'copy:build' ]
  },
  client_templates: {
    files: [ '<%= src.client %>/**/*.tpl.html', '!**/*.d.ts', ],
    tasks: [ 'angular', 'uglify', 'copy:build' ]
  },
  tsc_test: {
    files: [ '<%= src.test %>', '!**/*.d.ts' ],
    tasks: [ 'typescript:test', 'env:test', 'mochacli' ]
  }

};

