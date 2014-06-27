(function () {
  'use strict';

  angular.module('dl.modal', [])

    .controller('ModalCtrl', function ($scope, $modalInstance) {
      $scope.title = 'MODAL.TITLE.CONFIRM';
      $scope.message = 'MODAL.DELETE_CONFIRM_MSG';

      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    })
    .controller('ModalVideoCtrl', function ($rootScope, $scope, $modalInstance, $sce, $window, $log, dlApi, sharedProps, shotDate, videos) {

      var nemaData, animStepCount, animIndex, intervalId = null;

      function isGpsDataValid (nemaData) {
        return nemaData.lat && nemaData.lon;
      }

      function load (nemaResponse) {
        clearMapObjects();
        if (nemaResponse.length > 1) {
          var path = [];
          var bounds = new google.maps.LatLngBounds();
          var markerUpdated = false;
          for (var i = 0; i < nemaResponse.length; i++) {
            if (isGpsDataValid(nemaResponse[i])) {
              if (!markerUpdated) {
                updateMarker(nemaResponse[i]);
                markerUpdated = true;
              }
              var newPoint = new google.maps.LatLng(nemaResponse[i].lat, nemaResponse[i].lon);
              bounds.extend(newPoint);
              path.push(newPoint);
            }
          }
          $scope.polyline.setPath(path);
          $scope.gmap.map.fitBounds(bounds);
        } else {
          if (isGpsDataValid(nemaResponse[0])) {
            updateMarker(nemaResponse[0]);
            $scope.gmap.map.panTo(new google.maps.LatLng(nemaResponse[0].lat, nemaResponse[0].lon));
          }
        }
        nemaData = nemaResponse;
      }

      function updateMarker (nemaData) {
        var prevRotation = $scope.marker.getIcon() ? $scope.marker.getIcon().rotation:0;
        $scope.marker.setPosition(new google.maps.LatLng(nemaData.lat, nemaData.lon));
        $scope.marker.setIcon({
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: '#29d',
          fillOpacity: 1,
          strokeColor: '#29d',
          scale: 4,
          rotation: nemaData.hd ? nemaData.hd : prevRotation
        });
        $scope.marker._info = {
          t: nemaData.t, //time
          sp: nemaData.sp, //speed
          hd: nemaData.hd ? nemaData.hd : prevRotation, //heading
          alt: nemaData.alt //altitude
        };
        // Update infoWindow data as well
        if ($scope.infoWindow) {
          $scope.infoWindow.info = $scope.marker._info;
        }
        if (!$scope.marker.getMap()) { // set again if cleared
          $scope.marker.setMap($scope.gmap.map);
        }
      }

      function clearMapObjects () {
        // this is the only way to remove marker from the map
        $scope.marker.setMap(null);
        $scope.polyline.setPath([]);
      }

      function animateSymbol () {
        cancelAnimation();
        intervalId = $window.setInterval(function () {
          if (nemaData && animStepCount < nemaData.length) {
            $log.debug('animate - (stepCount, currentTime):' + animStepCount + ',' + $scope.currentTime);
            if (isGpsDataValid(nemaData[animStepCount])) {
              updateMarker(nemaData[animStepCount]);
              $scope.gmap.map.panTo(new google.maps.LatLng(nemaData[animStepCount].lat, nemaData[animStepCount].lon));
            }
            if (Math.abs($scope.currentTime - animStepCount) > 2) {
              // sync movie and map movement
              animStepCount = ~~$scope.currentTime;
            } else {
              animStepCount++;
            }
          } else {
            cancelAnimation();
          }
        }, 1000);
      }

      function cancelAnimation () {
        if (intervalId) {
          $window.clearInterval(intervalId);
          intervalId = null;
        }
      }

      $scope.shotDate = shotDate;
      $scope.videos = videos;
      $scope.gmap = {};
      $scope.gmapOptions = angular.extend(sharedProps.getDefaultMapOptions(), { streetViewControl: false });
      $scope.curIndex = 0;
      $scope.currentTime = 0;
      $scope.totalTime = 0;
      $scope.media = {
        url: $sce.trustAsResourceUrl($scope.videos[0].movie.url)
      };
      $scope.marker = new google.maps.Marker({});
      $scope.polyline = new google.maps.Polyline({
        strokeColor: '#0082ff',
        strokeOpacity: 1.0,
        strokeWeight: 4
      });

      $scope.$on('$destroy', function() {
        $log.debug('$destroy called');
        cancelAnimation();
      });

      $scope.onPlayerReady = function (API) {
        $log.debug('onPlayerReady');
        $scope.API = API;
        // initializes marker and polyline
        $scope.marker.setMap($scope.gmap.map);
        $scope.polyline.setMap($scope.gmap.map);
      };

      $rootScope.$on('onVgPlay', function () {
        $log.debug('onVgPlay');
        if (nemaData && animIndex === $scope.curIndex) {
          animateSymbol();
        } else {
          nemaData = null;
          dlApi.driveRecorderNema.query($scope.videos[$scope.curIndex], function (response) {
            if (response && response.length > 0) {
              load(response);
              animIndex = $scope.curIndex;
              animStepCount = 1;
              animateSymbol();
            } else {
              cancelAnimation();
              clearMapObjects();
            }
          });
        }
      });

      $rootScope.$on('onVgPause', function () {
        cancelAnimation();
      });

      $scope.onUpdateTime = function (currentTime, totalTime) {
        $scope.currentTime = currentTime;
        $scope.totalTime = totalTime;
      };

      $scope.onCompleteVideo = function() {
        // plays next video automatically if any available
        if ($scope.curIndex < $scope.videos.length - 1) {
          $scope.playVideo($scope.curIndex + 1);
        }
      };

      $scope.config = {
        width: 640,
        height: 360,
        autoPlay: true,
        autoHide: true,
        autoHideTime: 3000,
        responsive: false,
        theme: {
          url: '/static/css/drivelytics-app.css',
          playIcon: '&#xe000;',
          pauseIcon: '&#xe001;',
          volumeLevel3Icon: '&#xe002;',
          volumeLevel2Icon: '&#xe003;',
          volumeLevel1Icon: '&#xe004;',
          volumeLevel0Icon: '&#xe005;',
          muteIcon: '&#xe006;',
          enterFullScreenIcon: '&#xe007;',
          exitFullScreenIcon: '&#xe008;'
        }
      };

      $scope.playVideo = function (index) {
        $scope.curIndex = index;
        $scope.API.pause();
        $scope.media.url = $sce.trustAsResourceUrl($scope.videos[index].movie.url);
        $scope.API.play();
      };

      $scope.openInfoWindow = function (marker) {
        $scope.infoWindow = {
          info: marker._info
        };
        $scope.gmap.infoWindow.open($scope.gmap.map, marker);
      };

      $scope.formatVideoDuration = function (movie_length) {
        var hour = ~~(movie_length / 3600);
        var min = ~~((movie_length % 3600) / 60);
        var sec = movie_length % 60;

        if (hour >= 1) {
          return hour + 'h' + min + 'm' + sec + 's';
        } else if (min >= 1) {
          return min + 'm' + sec + 's';
        } else {
          return sec + 's';
        }
      };

      $scope.close = function () {
        $modalInstance.close();
      };
    });

}());