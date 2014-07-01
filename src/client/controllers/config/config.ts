///<reference path="../../../../def/angularjs/angular.d.ts" />
///<reference path="../../../../def/types.d.ts" />
declare var ace: any;

module jrpc.controllers.config {

  export interface IConfigScope extends ng.IScope {
    config: ConfigListController;
  }

  export class ConfigListController {
    public methods: jrpc.IJsonRpcMethod[];
    public addname = "";

    constructor(
        private $scope: IConfigScope,
        private $log: ng.ILogService,
        private $state: ng.ui.IStateService,
        private jrpcWebApi: jrpc.services.JrpcWebApi,
        private list: jrpc.IMethodList)
    {
      $log.debug('create ConfigListController controller.');
      this.methods = list.methods;
    }

    public add(): void {
      if (this.addname) {
        this.$state.go('config.detail', { name: this.addname });
      }
    }

    public reload(): void {
      this.jrpcWebApi.getMethods().then((list) => {
        this.methods = list.methods;
      });
    }

    public showList(): boolean {
      return this.$state.current.name === 'config';
    }

    public getMethod(name: string): jrpc.IJsonRpcMethod {
      for (var i = 0, len = this.methods.length; i < len; ++i) {
        var method = this.methods[i];
        if (method.name === name) return method;
      }
      return {
        name: name,
        isError: false,
        error: {
          code: 0,
          message: ""
        },
        result: {}
      };
    }

  }

  export class AlertBaseController {
    public alerts: {type: string; msg: string;}[] = [];

    constructor(
      public $scope: ng.IScope,
      public $timeout: ng.ITimeoutService)
    {
    }

    public addAlert(type: string, msg: string): void {
      var alert = {
        type: type,
        msg: msg
      };
      this.alerts.push(alert);
      this.$timeout(() => {
        this.alerts.splice(this.alerts.indexOf(alert), 1);
      }, 3000);
    }
    public closeAlert(index: number): void {
      this.alerts.splice(index, 1);
    }
  }

  export class ConfigDetailController extends AlertBaseController {
    public item: jrpc.IJsonRpcMethod;
    public isErrorExists = false;
    public text = "";
    public errorData = "";
    public running = false;

    constructor(
      public $scope: IConfigScope,
      public $timeout: ng.ITimeoutService,
      private $log: ng.ILogService,
      private $stateParams: ng.ui.IStateParamsService,
      private jrpcWebApi: jrpc.services.JrpcWebApi)
    {
      super($scope, $timeout);
      $log.debug('create ConfigDetailController controller: ' + $stateParams['name']);
      this.item = $scope.config.getMethod($stateParams['name']);
      this.text = angular.toJson(this.item.result, true);
      this.errorData = this.item.error && this.item.error.data ? angular.toJson(this.item.error.data, true) : "";
    }

    public save(): void {
      if (this.text) {
        this.item.result = JSON.parse(this.text);
      }
      if (this.errorData) {
        if (!this.item.error) {
          this.item.error = {
            code: 0,
            message: ""
          };
        }
        this.item.error.data = JSON.parse(this.errorData);
      }

      this.running = true;
      this.jrpcWebApi.updateMethod(this.item).then(() => {
        this.running = false;
        this.addAlert('success', 'success to save data.');
        this.$scope.config.reload();
      }, () => {
        this.running = false;
        this.addAlert('danger', 'fail to save data.');
      });
    }

    public delete(): void {
      this.running = true;
      this.jrpcWebApi.deleteMethod(this.item.name).then(() => {
        this.running = false;
        this.addAlert('success', 'success to delete data.');
        this.$scope.config.reload();
      }, () => {
        this.running = false;
        this.addAlert('danger', 'fail to delete data.');
      });
    }

    public aceLoaded(editor: any): void {
      var session = editor.getSession();
      session.setUndoManager(new ace.UndoManager());
      session.on('changeAnnotation', () => {
        this.safeApply(this.$scope, () => {
          this.isErrorExists = session.getAnnotations().length > 0;
        });
      });
    }

    public safeApply(scope: ng.IScope, fn: (scope: ng.IScope) => void): void {
      (scope.$$phase || scope.$root.$$phase) ? fn(scope) : scope.$apply(fn);
    }
  }

}

angular.module('jrpc.controllers.config', [])
  .controller('ConfigListController', (
    $scope: jrpc.controllers.config.IConfigScope,
    $log: ng.ILogService,
    $state: ng.ui.IStateService,
    jrpcWebApi: jrpc.services.JrpcWebApi,
    list: jrpc.IMethodList
  ) => new jrpc.controllers.config.ConfigListController($scope, $log, $state, jrpcWebApi, list))
  .controller('AlertBaseController', (
    $scope: jrpc.controllers.config.IConfigScope,
    $timeout: ng.ITimeoutService
  ) => new jrpc.controllers.config.AlertBaseController($scope, $timeout))
  .controller('ConfigDetailController', (
    $scope: jrpc.controllers.config.IConfigScope,
    $timeout: ng.ITimeoutService,
    $log: ng.ILogService,
    $stateParams: ng.ui.IStateParamsService,
    jrpcWebApi: jrpc.services.JrpcWebApi
  ) => new jrpc.controllers.config.ConfigDetailController($scope, $timeout, $log, $stateParams, jrpcWebApi))
;

