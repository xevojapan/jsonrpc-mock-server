'use strict';

angular.module('dl.calendar', ['dl.calendar-control'])

  .controller('CalendarCtrl', function ($scope, $routeParams, $filter, $timeout, $http, $log, utils) {

    function updateDateSelectorTitle(ctype, since) {
      var sinceDate = utils.getDateFromParam(since);
      $scope.calHeader.date = sinceDate;
      switch (ctype) {
        case 'd':
        case 'w':
          $scope.calHeader.format = 'TIME_FORMAT.Y_M';
          break;
        default:
          $scope.calHeader.format = 'TIME_FORMAT.Y';
      }
    }

    function updateDayCalendar() {
      $log.debug('updating calendar');
      var date = utils.getDateFromParam($scope.params.since);
      $scope.monthCalendar.fullCalendar('gotoDate', date);
      $scope.monthCalendar.fullCalendar('select', date, date, true);
    }

    function moveDate(dValue) {
      var since = utils.getDateFromParam($scope.params.since);
      var until = utils.getDateFromParam($scope.params.until);

      if ($scope.params.ctype === 'm') {
        since.setFullYear(since.getFullYear() + dValue);
        until.setFullYear(until.getFullYear() + dValue);
        $scope._updateDateParams($filter('date')(since, 'yyyyMMdd'), $filter('date')(until, 'yyyyMMdd'));
      } else {
        since.setMonth(since.getMonth() + dValue);
        until.setMonth(until.getMonth() + dValue);
        $scope.params.since = $scope.params.until = $filter('date')(since, 'yyyyMMdd');
        $scope.monthCalendar.fullCalendar('gotoDate', since);
      }
    }

    function updateEventSources() {
      var currentDate = $scope.monthCalendar.fullCalendar('getDate');
      var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      var monthEndDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      var requestUrl = '/api/drivelytics/data/calendar?since=' + $filter('date')(firstDay, 'yyyyMMdd') + '&until=' + $filter('date')(monthEndDay, 'yyyyMMdd');
      if($routeParams.userId) {
        requestUrl += '&user_id=' + $routeParams.userId;
      }
      $http.get(requestUrl).success(function(data) {
        var eventSource = {events:[], color: '#A9C11C'};
        angular.forEach(data, function(value) {
          eventSource.events.push({
            title: '',
            start: $filter('date')(value, 'yyyy-MM-dd')
          });
        });
        $scope.eventSources.length = 0;
        $log.debug('eventSource:' + angular.toJson(eventSource, true));
        $scope.eventSources.push(eventSource);
      });
    }

    $scope.calHeader = {};

    $scope.select = function (startDate, endDate, allDay) {
      var selectedDate = $scope.selectedDate = $filter('date')(startDate, 'yyyyMMdd');
      $log.debug('selectedDate: ' + selectedDate);
      $scope.monthCalendar.fullCalendar('gotoDate', startDate);
      $scope._updateDateParams(selectedDate, selectedDate);
      //check if a $digest is already in progress
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    $scope.unselect = function (view, event) {
      $log.debug('unselect');
      updateDayCalendar();
    };

    $scope.goPrev = function () {
      if ($scope.params.ctype === 'w') {
        $scope.$broadcast('moveWeekCalPrev');
      } else {
        moveDate(-1);
      }
    };

    $scope.goNext = function () {
      if ($scope.params.ctype === 'w') {
        $scope.$broadcast('moveWeekCalNext');
      } else {
        moveDate(1);
      }
    };

    // calendar config object
    $scope.uiConfig = {
      calendar: {
        height: 187,
        selectable: true,
        select: $scope.select,
        unselect: $scope.unselect,
        unselectAuto: false,
        editable: false,
        header: false
      }
    };

    $scope.eventSources = [];

    $scope.$watch(function() {
      return $scope.monthCalendar.fullCalendar('getDate').getMonth();
    }, function(newValue, oldValue) {
      $log.debug('newValue:' + newValue);
      $log.debug('oldValue:' + oldValue);

      updateEventSources();
    });

    $scope.$on('calendarLoaded', function () {
      $log.debug('calendarLoaded:' + angular.toJson($scope.params, true));
      if ($scope.params.ctype === 'd') {
        $log.debug('calendarLoaded updating');
        updateDayCalendar();
      }
      updateDateSelectorTitle($scope.params.ctype, $scope.params.since);
    });

    $scope.$on('$routeUpdate', function () {
      $log.debug('calendar.js->routeUpdated:' + $scope.params.ctype);
      if ($scope._isParamsValid()) {
        if ($scope.params.ctype === 'd' && $scope.params.since !== $scope.selectedDate) {
          //TODO: watch for css's display property to change, then update?
          $timeout(updateDayCalendar, 100);
        }
        if ($scope.params.ctype !== 'w') {
          updateDateSelectorTitle($scope.params.ctype, $scope.params.since);
        }
      }
    });

  });