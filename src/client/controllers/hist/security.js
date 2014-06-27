(function () {
  'use strict';
  angular.module('dl.security.service', [])

    .factory('security', function ($http, $q, $location, $log) {
      var userRoles = userConfig.roles;

      var service = {
        requestCurrentUser: function () {
          return $q.when(service.currentUser);
        },

        currentUser: null,

        isAuthenticated: function () {
          return true;
        },
        isSuperUser: function () {
          return false;
        },
        isAdmin: function () {
          return false;
        }
      };
      return service;
    });
}());