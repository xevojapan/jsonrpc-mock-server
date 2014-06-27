///<reference path="../../../def/angularjs/angular.d.ts" />
///<reference path="../../../def/types.d.ts" />

module bws.controllers {

  export class IndexWrapperController {
    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $location: ng.ILocationService) {
    }

    public getClass(base: string): string {
      var path = this.$location.path().split('/')[1];
      switch (path) {
        case 'login': return base + '_login';
        case 'info': return base + '_mycar';
        case 'history': return base + '_history';
        case 'navigation': return base + '_navigation';
        case 'app': return base + '_app';
        default: return base + '_top';
      }
    }
  }

  export class HeaderController {
    constructor(
        private $scope: ng.IScope,
        private $log: ng.ILogService,
        private bwsUtil: bws.services.BwsUtil) {
    }

    public checkPath(path: string): boolean {
      return this.bwsUtil.checkPath(path);
    }
  }

}

angular.module('bws.controllers', [])
  .controller('IndexWrapperController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $location: ng.ILocationService
  ) => new bws.controllers.IndexWrapperController($scope, $log, $location))
  .controller('HeaderController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    bwsUtil: bws.services.BwsUtil
  ) => new bws.controllers.HeaderController($scope, $log, bwsUtil))
;

