'use strict';

angular.module('dl.past', ['dl.past-detail', 'dl.calendar'])

  .controller('PastCtrl', function ($scope, $location, $filter, $timeout, $log, utils) {

    function initParams() {
      $log.debug('initParams');
      $scope.params.ctype = 'd';
      var today = $filter('date')(new Date(), 'yyyyMMdd');
      $scope._updateDateParams(today, today);
    }

    $scope.params = $location.search();
    $log.debug('params:' + angular.toJson($scope.params, true));
    $scope._isParamsValid = function () {
      return ($scope.params.ctype && $scope.params.since && $scope.params.until);
    };

    $scope._updateDateParams = function (since, until, ctype) {
      $log.debug('_updateDateParams:' + angular.toJson($scope.params, true));
      $location.search(angular.extend($scope.params, {
        since: since,
        until: until,
        ctype: ctype || $scope.params.ctype
      }));
    };

    if (!$scope._isParamsValid()) {
      initParams();
    }

    $scope.$on('$includeContentLoaded', function () {
      $log.debug('$includeContentLoaded');
      //notifies CalendarCtrl that content is loaded
      $scope.$broadcast('calendarLoaded');
    });

    $scope.$on('$routeUpdate', function () {
      $log.debug('routeUpdated->' + $scope.params.ctype);
      $scope.params = $location.search();
      if (!$scope._isParamsValid()) {
        initParams();
      }
    });

  });