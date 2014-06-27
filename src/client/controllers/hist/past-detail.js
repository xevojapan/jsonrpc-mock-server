'use strict';

angular.module('dl.past-detail', ['dl.modal'])

  .controller('PastDetailCtrl', function ($scope, $filter, $location, $routeParams, $modal, $timeout, $log, security, dlApi, utils, sharedProps, loadingBar) {

    function updateTrips() {
      var reqParams = {
        user_id: $scope.userId,
        since: $scope.params.since,
        until: $scope.params.until,
        edgemarker: $scope.params.ctype === 'd' ? 1 : 0
      };

      loadingBar.start();
      dlApi.trips.get(reqParams, function (response) {
        loadingBar.complete();
        $log.debug('tripResponse:' + angular.toJson(response));

        var tripData = $scope.tripData = response;
        clearTripData();

        if (tripData.groups.length > 0) {
          angular.forEach(tripData.groups, function (group) {
            if ($scope.params.ctype === 'm' || $scope.params.ctype === 'w') {
              addTripSummaryData(group);
            }
            angular.forEach(group.trips, function (trip) {
              addTrip(trip.start, trip.end);
              addHarshMarkers(trip);
              var dataPoints = trip['path'];
              if (dataPoints) {
                for (var i = 0; i < dataPoints.length; i++) {
                  var decodedPath = google.maps.geometry.encoding.decodePath(dataPoints[i].p);
                  addPath(decodedPath, utils.getStrokeColor(dataPoints[i].t), dataPoints[i]);
                }
              }
            });
          });
        }
        if (tripData.min_lat && tripData.min_lon && tripData.max_lat && tripData.max_lon) {
          fitMapIntoBounds(new google.maps.LatLng(tripData.min_lat, tripData.min_lon),
            new google.maps.LatLng(tripData.max_lat, tripData.max_lon));
        }
      });
    }

    function addTripSummaryData(group) {
      // ignore if driving time is less than or equal to 0
      if (group.ope_t <= 0) {
        return;
      }
      $scope.summaryList.push({
        time: group.time,
        odo: group.odo,
        ope_t: group.ope_t,
        break_t: group.break_t,
        fe: group.fe,
        msp: group.msp,
        c_ope_t: group.c_ope_t
      });
    }

    function addTrip(o_data, d_data) {
      if (o_data && d_data) {
        var o_pos = new google.maps.LatLng(o_data.lat, o_data.lon);
        var e_pos = new google.maps.LatLng(d_data.lat, d_data.lon);

        var index = Math.min($scope.markers.length, sharedProps.getAlphabets().length - 2);
        var o_address = {
          alphabetImg: '/api/drivelytics/past/addrmarker/' + index + '/large',
          date: $filter('date')(o_data.t, 'H:mm'),
          pos: o_pos
        };
        var e_address = {
          alphabetImg: '/api/drivelytics/past/addrmarker/' + (index + 1) + '/large',
          date: $filter('date')(d_data.t, 'H:mm'),
          pos: e_pos
        };
        getAddress(o_address, o_data.lat, o_data.lon);
        getAddress(e_address, d_data.lat, d_data.lon);

        $scope.markers.push(createMarker('/api/drivelytics/past/addrmarker/' + $scope.markers.length + '/small', o_pos, o_data));
        $scope.markers.push(createMarker('/api/drivelytics/past/addrmarker/' + $scope.markers.length + '/small', e_pos, d_data));
      }
    }

    function addPath(decodedPath, strokeColor, dataPoint) {
      var path = new google.maps.Polyline({
        path: decodedPath,
        strokeColor: strokeColor,
        strokeOpacity: 1.0,
        strokeWeight: 4,
        info: dataPoint,
        map: $scope.map.pastMap
      });

      $scope.paths.push(path);
    }

    function createMarker(icon, latLng, info) {
      var marker = new google.maps.Marker({
        position: latLng,
        icon: icon,
        shadow: '/static/img/map_mark_shadow.png',
        map: $scope.map.pastMap,
        info: info
      });
      return marker;
    }

    function addHarshMarkers(trip) {
      angular.forEach(trip.hbke, function(data) {
        $scope.harshMarkers.push(createMarker('/static/img/mapicon_accelerate.png', new google.maps.LatLng(data.lat, data.lon), data));
      });
      angular.forEach(trip.hace, function(data) {
        $scope.harshMarkers.push(createMarker('/static/img/mapicon_brake.png', new google.maps.LatLng(data.lat, data.lon), data));
      });
    }

    function deletePaths() {
      for (var i = 0; i < $scope.paths.length; i++) {
        $scope.paths[i].setMap(null);
      }
      $scope.paths.length = 0;
    }

    function deleteMarkers() {
      for (var i = 0; i < $scope.markers.length; i++) {
        $scope.markers[i].setMap(null);
      }
      for (var j = 0; j < $scope.harshMarkers.length; j++) {
        $scope.harshMarkers[j].setMap(null);
      }
      $scope.markers.length = 0;
      $scope.harshMarkers.length = 0;
    }

    function clearTripData() {
      deletePaths();
      deleteMarkers();
      $scope.addresses.length = 0;
      $scope.summaryList.length = 0;
    }

    function fitMapIntoBounds(sw, ne) {
      $scope.map.bounds = new google.maps.LatLngBounds(sw, ne);
      $scope.map.pastMap.fitBounds($scope.map.bounds);
    }

    function getAddress(address, lat, lon) {
      $scope.addresses.push(address);
      dlApi.reverseGeocode.get({
        lat: lat,
        lon: lon
      }, function (response) {
        $log.debug('Address:' + angular.toJson(response));
        address.addr = response.address;
      });
    }

    $scope.userId = $routeParams.userId;
    $scope.paths = [];
    $scope.markers = [];
    $scope.harshMarkers = [];
    $scope.addresses = [];
    $scope.summaryList = [];
    $scope.map = {};
    $scope.gmapOptions = sharedProps.getDefaultMapOptions();
    $scope.mapExpanded = false;
    $scope.isSuperUser = security.isSuperUser;
    $scope.getDateFromParam = utils.getDateFromParam;
    $scope.getLabelForCType = utils.getLabelForCType;
    $scope.getDateFormatForCType = utils.getDateFormatForCType;

    $scope.$on('$routeUpdate', function () {
      //$log.debug('PastDetailCtrl->$routeUpdate:' + $scope.params.ctype);
      updateTrips();
      updateVideos();
    });

    $scope.selectSummary = function (summary) {
      var since = $filter('date')(summary.time, 'yyyyMMdd');
      //update search params to load new data
      $location.search({
        since: since,
        until: since,
        ctype: 'd'
      });
    };

    $scope.openInfoWindow = function (marker) {
      $scope.infoWindow = {
        info: marker.info
      };
      $scope.map.detailInfoWindow.open($scope.map.pastMap, marker);
    };

    $scope.panTo = function (pos) {
      $scope.map.pastMap.panTo(pos);
    };

    //if superUser, retrieves the target user information
    security.requestCurrentUser().then(function () {
      if (security.isSuperUser()) {
        dlApi.user.get({id: $scope.userId}, function (response) {
          $log.debug('PastDetailCtrl:' + angular.toJson(response, true));
          $scope.user = response;
        });
      }
    });

    updateTrips();

    function updateVideos() {
      dlApi.driveRecorder.query({user_id: $scope.userId, since: $scope.params.since}, function (response) {
        $log.debug('RecordersResponse:' + angular.toJson(response, true));
        if (response.length > 0) {
          $scope.showVideoIcon = true;
          $scope.videos = response;
        } else {
          $scope.showVideoIcon = false;
        }
      });
    }

    $scope.showVideo = function () {
      $modal.open({
        templateUrl: 'past/video-dialog.tpl.html',
        controller: 'ModalVideoCtrl',
        windowClass: 'modal-dialog-video',
        resolve: {
          shotDate: function () {
            return $scope.getDateFromParam($scope.params.since);
          },
          videos: function() {
            return $scope.videos;
          }
        }
      });
    };

    updateVideos();


    $scope.$watch('mapExpanded', function() {
      $timeout(function(){
        var map = $scope.map.pastMap;
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
        if ($scope.map.bounds) {
          $scope.map.pastMap.fitBounds($scope.map.bounds);
        }
      });
    });
  });
