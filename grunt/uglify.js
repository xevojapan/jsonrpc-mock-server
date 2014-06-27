"use strict";

module.exports = {

  options: {
    sourceMap: true,
    except: ['jQuery'],
    banner: '/*! <%= package.name %> - v<%= package.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %> */'
  },

  lightbox: {
    files: {
      'bower_components/ekko-lightbox/ekko-lightbox.min.js': 'bower_components/ekko-lightbox/ekko-lightbox.js'
    }
  },

  destaque: {
    files: {
      'bower_components/destaque/destaque.min.js': 'bower_components/destaque/destaque.js'
    }
  },

  decarta: {
    files: {
      '<%= dest.client %>/decarta.min.js': '<%= dest.client %>/decarta.js'
    }
  },

  client: {
    files: {
      '<%= dest.client %>/<%= package.name %>.min.js': '<%= dest.client %>/<%= package.name %>.js',
      '<%= dest.client %>/templates.min.js': '<%= dest.client %>/templates.js'
    }
  }

};

