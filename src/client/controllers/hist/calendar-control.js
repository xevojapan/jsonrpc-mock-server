'use strict';

angular.module('dl.calendar-control', [])
  .directive('calendarNav', function ($location) {
    return {
      restrict: 'E',
      scope: {},
      controller: function ($scope, $element) {
        var navbars = $scope.navbars = [];
        $scope.select = function (navbar) {
          angular.forEach(navbars, function (navbar) {
            navbar.selected = false;
          });
          $location.search('ctype', navbar.ctype);
          navbar.selected = true;
        };

        this.addNavBar = function (navbar) {
          navbars.push(navbar);
        };

        this.addNavBar({
          title: 'CAL.DAY',
          ctype: 'd'
        });
        this.addNavBar({
          title: 'CAL.WEEK',
          ctype: 'w'
        });
        this.addNavBar({
          title: 'CAL.MONTH',
          ctype: 'm'
        });

        $scope.location = $location;
        $scope.$watch('location.search()["ctype"]', function (newCtype) {
          angular.forEach(navbars, function (navbar) {
            if (navbar.ctype === newCtype) {
              navbar.selected = true;
            } else {
              navbar.selected = false;
            }
          });
        });
      },
      template: '<ul class="real_cal_tab">' + '<li ng-repeat="navbar in navbars">' + '<a href="" ng-class="{selected:navbar.selected}" ng-click="select(navbar)">{{navbar.title | translate}}</a>' + '</li>' + '</ul>',
      replace: true
    };
  })
  .directive('monthCalendar', function ($location) {
    return {
      restrict: 'E',
      scope: true,
      controller: function ($scope, $element, $filter) {
        var months = $scope.months = [];

        function generateMonths(newSince) {
          months.length = 0;
          var currentYear = ~~(newSince / 10000);
          for (var i = 0; i < 12; i++) {
            var firstDay = new Date(currentYear, i, 1);
            var lastDay = new Date(currentYear, i + 1, 0);
            months.push({
              title: 'CAL.MONTH_NAMES',
              since: $filter('date')(firstDay, 'yyyyMMdd'),
              until: $filter('date')(lastDay, 'yyyyMMdd')
            });
          }
        }

        function isSameYear(newSince, oldSince) {
          return ~~(newSince / 10000) === ~~(oldSince / 10000);
        }

        $scope.select = function (month) {
          angular.forEach(months, function (month) {
            month.selected = false;
          });
          $location.search('since', month.since).search('until', month.until);
          month.selected = true;
        };

        $scope.location = $location;
        $scope.$watch('location.search()["since"]', function (newSince, oldSince) {
          if (months.length === 0 || !isSameYear(newSince, oldSince)) {
            generateMonths(newSince);
            $scope.select(months[Math.max(~~(newSince / 100 % 100) - 1, 0)]);
          }
        }, true);
      },
      template: '<ul class="mw-list">' + '<li ng-repeat="month in months">' + '<a href="" ng-class="{selected:month.selected}" ng-click="select(month)">{{("CAL.MONTH_NAMES" | translate).split(" ")[$index]}}</a>' + '</li>' + '</ul>',
      replace: true
    };
  })
  .directive('weekCalendar', function ($location) {
    return {
      restrict: 'E',
      scope: true,
      controller: function ($scope, $element, $filter, utils) {
        var weeks = $scope.weeks = [];
        var since = $scope.params.since;
        var currentYear = ~~(since / 10000);
        var currentMonth = ~~(since / 100 % 100);
        var selectedWeek;

        function generateWeeks() {
          weeks.length = 0;
          var firstDay = new Date(currentYear, currentMonth - 1, 1);
          var monthEndDay = new Date(currentYear, currentMonth, 1);
          firstDay.setTime(firstDay.getTime() - firstDay.getDay() * 86400 * 1000);

          while (firstDay.getTime() < monthEndDay.getTime()) {
            var weekEndDay = new Date(firstDay.getTime() + 86400 * 1000 * 6);
            weeks.push({
              i: weeks.length,
              firstDay: firstDay,
              lastDay: weekEndDay,
              since: $filter('date')(firstDay, 'yyyyMMdd'),
              until: $filter('date')(weekEndDay, 'yyyyMMdd')
            });
            firstDay = new Date(weekEndDay.getTime() + 86400 * 1000);
          }
        }

        function updateWeeks(dMonth) {
          var targetMonth1th = new Date(currentYear, currentMonth - 1 + dMonth, 1);
          since = $filter('date')(targetMonth1th, 'yyyyMMdd');
          currentYear = ~~(since / 10000);
          currentMonth = ~~(since / 100 % 100);
          generateWeeks();
          updateCalHeaderTitle();
          $scope.select(weeks[selectedWeek.i < weeks.length ? selectedWeek.i : weeks.length - 1]);
        }

        function updateCalHeaderTitle() {
          $scope.calHeader.date = utils.getDateFromParam(since);
        }

        $scope.select = function (week) {
          angular.forEach(weeks, function (week) {
            week.selected = false;
          });
          $location.search('since', week.since).search('until', week.until);
          week.selected = true;
          selectedWeek = week;
        };

        $scope.$on('moveWeekCalPrev', function () {
          updateWeeks(-1);
        });

        $scope.$on('moveWeekCalNext', function () {
          updateWeeks(1);
        });

        //Generate initial weeks and set initial focus
        generateWeeks();
        updateCalHeaderTitle();
        var initialDate = utils.getDateFromParam(since);
        for (var i = 0; i < weeks.length; i++) {
          if (!(initialDate.getTime() < utils.getDateFromParam(weeks[i].since).getTime() || initialDate.getTime() > utils.getDateFromParam(weeks[i].until).getTime())) {
            $scope.select(weeks[i]);
            break;
          }
        }
      },
      template: '<ul class="mw-list">' + '<li ng-repeat="week in weeks">' + '<a href="" ng-class="{selected:week.selected}" ng-click="select(week)">{{(week.firstDay | date:("TIME_FORMAT.M_D" | translate)) + " ~ " + (week.lastDay | date:("TIME_FORMAT.M_D" | translate))}}</a>' + '</li>' + '</ul>',
      replace: true
    };
  });