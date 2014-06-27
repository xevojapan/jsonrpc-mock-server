(function () {
  'use strict';

  angular.module('dl.filters', [])
    .filter('formatTime', function ($translate) {
      var translateIvoked = false;
      var hourSuffix = null;
      var minSuffix = null;

      function filter(msec) {
        if(msec && angular.isNumber(msec)) {
          var msecPerMinute = 1000 * 60;
          var msecPerHour = msecPerMinute * 60;
          var hour = Math.floor(msec / msecPerHour);
          var min = Math.floor((msec % msecPerHour) / msecPerMinute);

          if(hour > 0) {
            return hour + hourSuffix+ min + minSuffix;
          } else {
            return min + minSuffix;
          }
        }
        return '-';
      }

      return function(msec) {
        if (hourSuffix && minSuffix) {
          return filter(msec);
        } else {
          if (!translateIvoked) {
            translateIvoked = true;
            $translate('TIME_FORMAT.MIN_SUFFIX').then(function(value) {
              minSuffix = value;
            });
            $translate('TIME_FORMAT.HOUR_SUFFIX').then(function(value) {
              hourSuffix = value;
            });
          }
          return '-';
        }
      };
    })
    .filter('toFixed', function () {
      return function(num, param) {
        if(num && angular.isNumber(num)) {
          if(param && angular.isNumber(param)) {
            return num.toFixed(param);
          } else {
            return num.toFixed(2);
          }
        }
        return '-';
      };
    });
}());