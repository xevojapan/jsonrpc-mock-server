///<reference path="../../../def/angularjs/angular.d.ts" />
///<reference path="../../../def/angular-ui/angular-ui-router.d.ts" />
///<reference path="../../../def/types.d.ts" />

module jrpc.controllers {

  export class TabStateController {
    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $state: ng.ui.IStateService)
    {
    }
  }

}

angular.module('jrpc.controllers', [])
  .controller('TabStateController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $state: ng.ui.IStateService
  ) => new jrpc.controllers.TabStateController($scope, $log, $state))
;

