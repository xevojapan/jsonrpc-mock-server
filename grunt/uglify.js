"use strict";

module.exports = {

  options: {
    sourceMap: true,
    except: ['jQuery'],
    banner: '/*! <%= package.name %> - v<%= package.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %> */'
  },

  client: {
    files: {
      '<%= dest.client %>/<%= package.name %>.min.js': '<%= dest.client %>/<%= package.name %>.js',
      '<%= dest.client %>/templates.min.js': '<%= dest.client %>/templates.js'
    }
  }

};

