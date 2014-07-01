///<reference path="../../../../def/angularjs/angular.d.ts" />
///<reference path="../../../../def/types.d.ts" />

module jrpc.controllers.log {

  export class AccessLogController {
    constructor(
      private $scope: ng.IScope,
      private $timeout: ng.ITimeoutService,
      private $log: ng.ILogService,
      private jrpcWebApi: jrpc.services.JrpcWebApi,
      private log: jrpc.ILogResult)
    {
      $timeout(() => {
        var textarea = angular.element('#accessLog');
        textarea.scrollTop(textarea[0].scrollHeight);
      });
    }
  }

}

angular.module('jrpc.controllers.log', [])
  .controller('AccessLogController', (
    $scope: jrpc.controllers.config.IConfigScope,
    $timeout: ng.ITimeoutService,
    $log: ng.ILogService,
    jrpcWebApi: jrpc.services.JrpcWebApi,
    log: jrpc.ILogResult
  ) => new jrpc.controllers.log.AccessLogController($scope, $timeout, $log, jrpcWebApi, log))
;

