///<reference path="../../../../def/angularjs/angular.d.ts" />
///<reference path="../../../../def/decarta/js4.d.ts" />
///<reference path="../../../../def/types.d.ts" />

module bws.controllers {

  export class CarInfoController {
    public today = new Date();
    public map: deCarta.Core.Map;
    public mapOptions: any;

    constructor(
        private $scope: ng.IScope,
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $filter: ng.IFilterService,
        private mapHelper: bws.services.MapHelper)
    {
      var content =
        '<div class="info_window_infopage">' +
        '<div class="address_info_window">46100 Grand River Ave, Novi, MI 48374</div>' +
        '<div class="update_infowindow">Last updated: ' + $filter('date')(this.today) + '</div>' +
        '</div>';

      this.mapOptions = mapHelper.createDefaultMapOption(14, content);
    }
  }

}

angular.module('bws.controllers.info', [])
  .controller('CarInfoController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $location: ng.ILocationService,
    $filter: ng.IFilterService,
    mapHelper: bws.services.MapHelper
  ) => new bws.controllers.CarInfoController($scope, $log, $location, $filter, mapHelper));
