(function (exports) {
  'use strict';

  function buildRoles(roles) {
    var userRoles = {};
    for (var role in roles) {
      userRoles[roles[role]] = {
        title: roles[role]
      };
    }
    return userRoles;
  }

  var config = {
    roles: [
      'User',
      'SuperUser',
      'Admin',
      'Owner',
      'Master'
    ]
  };

  exports.roles = buildRoles(config.roles);

})(typeof exports === 'undefined' ? this['userConfig'] = {} : exports);