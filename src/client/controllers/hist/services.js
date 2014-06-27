(function () {
  'use strict';

  /* Services */
  angular.module('dl.services', ['ngResource'])

    //based on https://github.com/chieffancypants/angular-loading-bar
    .provider('loadingBar', function() {

      this.includeSpinner = true;
      this.includeBar = true;
      this.parentSelector = 'div.loading_bar';

      this.$get = function ($document, $timeout, $animate) {

        var $parentSelector = this.parentSelector,
          loadingBarContainer = angular.element('<div id="loading-bar"><div class="bar"></div></div>'),
          loadingBar = loadingBarContainer.find('div').eq(0),
          spinner = angular.element('<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>');

        var incTimeout,
          completeTimeout,
          started = false,
          status = 0;

        var includeSpinner = this.includeSpinner;
        var includeBar = this.includeBar;

        /**
         * Inserts the loading bar element into the dom, and sets it to 2%
         */
        function _start() {
          var $parent = $document.find($parentSelector);
          $timeout.cancel(completeTimeout);

          // do not continually broadcast the started event:
          if (started) {
            return;
          }

          started = true;

          if (includeBar) {
            $animate.enter(loadingBarContainer, $parent);
          }

          if (includeSpinner) {
            $animate.enter(spinner, $parent);
          }
          _set(0.02);
        }

        /**
         * Set the loading bar's width to a certain percent.
         *
         * @param n any value between 0 and 1
         */
        function _set(n) {
          if (!started) {
            return;
          }
          var pct = (n * 100) + '%';
          loadingBar.css('width', pct);
          status = n;

          // increment loadingbar to give the illusion that there is always
          // progress but make sure to cancel the previous timeouts so we don't
          // have multiple incs running at the same time.
          $timeout.cancel(incTimeout);
          incTimeout = $timeout(function() {
            _inc();
          }, 250);
        }

        /**
         * Increments the loading bar by a random amount
         * but slows down as it progresses
         */
        function _inc() {
          if (_status() >= 1) {
            return;
          }

          var rnd = 0;
          var stat = _status();
          if (stat >= 0 && stat < 0.25) {
            // Start out between 3 - 6% increments
            rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
          } else if (stat >= 0.25 && stat < 0.65) {
            // increment between 0 - 3%
            rnd = (Math.random() * 3) / 100;
          } else if (stat >= 0.65 && stat < 0.9) {
            // increment between 0 - 2%
            rnd = (Math.random() * 2) / 100;
          } else if (stat >= 0.9 && stat < 0.99) {
            // finally, increment it .5 %
            rnd = 0.005;
          } else {
            // after 99%, don't increment:
            rnd = 0;
          }

          var pct = _status() + rnd;
          _set(pct);
        }

        function _status() {
          return status;
        }

        function _complete() {
          _set(1);

          // Attempt to aggregate any start/complete calls within 500ms:
          completeTimeout = $timeout(function() {
            $animate.leave(loadingBarContainer, function() {
              status = 0;
              started = false;
            });
            $animate.leave(spinner);
          }, 500);
        }

        return {
          start          : _start,
          set            : _set,
          status         : _status,
          inc            : _inc,
          complete       : _complete,
          includeSpinner : this.includeSpinner,
          parentSelector : this.parentSelector
        };
      };
    })

    .factory('sharedProps', function () {
      /* @const */
      var MAP_STYLE = [
        { "featureType": "road", "stylers": [
          { "saturation": -100 },
          { "gamma": 3.98 }
        ] },
        { "featureType": "transit.line", "stylers": [
          { "saturation": -100 }
        ] },
        { "featureType": "poi.business", "stylers": [
          { "saturation": -100 }
        ] }
      ];

      /* @const */
      var ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

      return {
        getDefaultMapOptions: function () {
          return {
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: MAP_STYLE,
            panControl: false,
            scrollwheel: false
          };
        },
        getDefaultGravatarOptions: function (size) {
          return {
            size: size || 30,
            defaultImage: 'mm'
          };
        },
        getDefaultLocation: function () {
          // Tokyo Station
          return {
            lat: 35.6808,
            lon: 139.7669
          };
        },
        getAlphabets: function () {
          return ALPHABETS;
        }
      };
    })

    .factory('dlApi', function ($resource) {
      var apis = {};
      apis.trips = $resource('/api/drivelytics/data/trips', {}, {});
      apis.reverseGeocode = $resource('/api/drivelytics/revgeocode', {}, {});
      apis.driveRecorder = $resource('/api/drivelytics/driverecorder/list', {}, {});
      apis.driveRecorderNema = $resource('/api/drivelytics/driverecorder/parsenmea/:id', {id:'@id'}, {});
      // /api/past/addrmarker/
      // /api/data/calendar
      /*
      apis.lastPosition = $resource('/api/real/lastposition', {}, {});
      apis.realTimeDeviceList = $resource('/api/real/devicelist', {}, {});
      apis.userSummaryList = $resource('/api/data/userlist', {}, {});
      apis.trips = $resource('/api/data/trips', {}, {});
      apis.userList = $resource('/api/user/list', {}, {});
      apis.user = $resource('/api/user/user/:id', {id:'@id'}, {update: {method:'PUT'}});
      apis.username = $resource('/api/user/username/:username', {username:'@username'}, {});
      apis.vehicleList = $resource('/api/vehicle/list', {}, {});
      apis.vehicleUserList = $resource('/api/vehicle/userlist', {}, {});
      apis.vehicle = $resource('/api/vehicle/:path/:id', {path: 'vehicle', id:'@id'}, {update: {method:'PUT'}});
      apis.dtcList = $resource('/api/dtc/list', {}, {});
      apis.dtc = $resource('/api/dtc/fix/:id', {id:'@id'}, {update: {method:'PUT'}});
      apis.geofenceList = $resource('/api/geofence/list', {}, {});
      apis.geofence = $resource('/api/geofence/geofence/:id', {id:'@id'}, {update: {method:'PUT'}});
      apis.geofenceAppend = $resource('/api/geofence/append/:id/:unit_id', {id:'@id', unit_id: '@unit_id'}, {});
      apis.geofenceRemove = $resource('/api/geofence/remove/:id/:unit_id', {id:'@id', unit_id: '@unit_id'}, {});
      apis.driveRecorder = $resource('/api/driverecorder/list', {}, {});
      apis.driveRecorderNema = $resource('/api/driverecorder/parsenmea/:id', {id:'@id'}, {});
      apis.changeOrg = $resource('/api/changeorg', {}, {});
      */
      return apis;
    })

    .factory('utils', function ($filter, $translate) {
      function getDateFromParam(dateParam) {
        return new Date(~~(dateParam / 10000), ~~(dateParam / 100 % 100) - 1, dateParam % 100);
      }

      return {
        getDateFromParam: getDateFromParam,
        getLabelForCType: function (ctype) {
          switch (ctype) {
            case 'd':
              return 'DAY';
            case 'w':
              return 'WEEK';
            case 'm':
              return 'MONTH';
            default:
              return '';
          }
        },
        getDateFormatForCType: function (ctype) {
          switch (ctype) {
            case 'd':
            case 'w':
              return 'TIME_FORMAT.M_D';
            case 'm':
              return 'TIME_FORMAT.Y_M';
            default:
              return 'TIME_FORMAT.Y_M';
          }
        },
        getStrokeColor: function (category) {
          if (category === 0) {
            return '#883ea7';
          } else if (category === 1) {
            return '#0adc00';
          } else if (category === 2) {
            return '#0082ff';
          } else {
            return '#d90000';
          }
        }
      };
    })

    .factory('realtimeSocket', function($rootScope) {
        function createWebSocketOnNamespace(ns, $rootScope) {
            var socket = io.connect(ns);
            return {
                on: function(eventName, callback) {
                    socket.on(eventName, function() {
                        if (callback) {
                            var args = arguments;
                            $rootScope.$apply(function() {
                                callback.apply(socket, args);
                            });
                        }
                    });
                },
                emit: function(eventName, data, callback) {
                    socket.emit(eventName, data, function() {
                        if (callback) {
                            var args = arguments;
                            $rootScope.$apply(function() {
                                callback.apply(socket, args);
                            });
                        }
                    });
                },
                clear: function() {
                    socket.removeAllListeners();
                },
            };
        }

        var socks = {};
        socks.position = createWebSocketOnNamespace('/position', $rootScope);
        return socks;
    });

}());

