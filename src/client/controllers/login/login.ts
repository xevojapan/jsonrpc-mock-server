///<reference path="../../../../def/angularjs/angular.d.ts" />
///<reference path="../../../../def/decarta/js4.d.ts" />
///<reference path="../../../../def/types.d.ts" />

module bws.controllers {

  export class LoginController {
    public email = "";
    public password = "";
    public errorShown = false;

    constructor(
        private $scope: ng.IScope,
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private bentoWebApi: bws.services.BentoWebApi)
    {
    }

    public signin(): void {
      this.bentoWebApi.login(this.email, this.password).then((res: IResult) => {
        this.$log.debug('login success.');
        this.$location.path('/');
      }, (err: any) => {
        this.$log.warn('login error: ' + err.data.result);
        this.errorShown = true;
      });
    }

    public signout(): void {
      this.bentoWebApi.logout().then((res: IResult) => {
        this.$log.debug('logout success.');
      }, (err: any) => {
        this.$log.warn('logout error: ' + err.data.result);
        this.errorShown = true;
      });
    }
  }

}

angular.module('bws.controllers.login', [])
  .controller('LoginController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $location: ng.ILocationService,
    bentoWebApi: bws.services.BentoWebApi
  ) => new bws.controllers.LoginController($scope, $log, $location, bentoWebApi));

