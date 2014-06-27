///<reference path="../../../../def/angularjs/angular.d.ts" />
///<reference path="../../../../def/types.d.ts" />

module bws.controllers {

  export class AppHeaderController {
    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private bwsUtil: bws.services.BwsUtil)
    {
    }

    public checkPath(path: string): boolean {
      return this.bwsUtil.checkPath(path, 2);
    }
  }

  export class AppStoreController {
    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $location: ng.ILocationService,
      private $timeout: ng.ITimeoutService,
      private bentoWebApi: bws.services.BentoWebApi,
      private appList: bws.IAppCategory)
    {
    }

    public installApp(app: bws.IAppInfo) {
      app.installed = true;
      app.installing = true;
      this.bentoWebApi.installApp(app.appid).then((res: IResult) => {
        this.$log.info(app.appid + ' is installed.');
        this.$timeout(() => {
          app.installing = false;
        }, 3000);
      }, (err: any) => {
        this.$log.warn('Fail to install: ' + app.appid);
        app.installing = false;
        app.installed = false;
      });
    }
  }

  export class AppDetailController {
    public totalCount = 0;
    public average = 0;

    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $location: ng.ILocationService,
      private $timeout: ng.ITimeoutService,
      private bentoWebApi: bws.services.BentoWebApi,
      private info: bws.IAppInfo)
    {
      if (info.review) {
        var sum = 0;
        var count = 0;
        info.review.count.forEach((n, i) => {
          count += n;
          sum += (i + 1) * n;
        });
        this.totalCount = count;
        this.average = sum / count;
      }
    }

    public installApp(app: bws.IAppInfo): void {
      app.installed = true;
      app.installing = true;
      this.bentoWebApi.installApp(app.appid).then((res: IResult) => {
        this.$log.info(app.appid + ' is installed.');
        this.$timeout(() => {
          app.installing = false;
        }, 3000);
      }, (err: any) => {
        this.$log.warn('Fail to install: ' + app.appid);
        app.installing = false;
        app.installed = false;
      });
    }
  }

  export class MyAppsController {
    public pageCount = 8;

    public pages: number[];
    public apps: bws.IDisplayApp[];
    public dataChanged = false;

    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $location: ng.ILocationService,
      private bentoWebApi: bws.services.BentoWebApi,
      private myapps: bws.IMyApps)
    {
      this.cancel();
    }

    public sortableOption = {
      opacity: 0.7,
      revert: 100,
      scroll: false,
      tolerance: "pointer",
      update: (ev: Event, ui: any) => {
        this.$log.debug('update: ' + ui.item.scope().$index);
        this.dataChanged = true;
      }
    };
    public checkAddMargin(index: number): boolean {
      var mod = index % this.pageCount;
      return mod === this.pageCount - 3 || mod === this.pageCount - 2;
    }

    private createPages(): number[] {
      var result = [1];
      for (var i = 1, len = this.apps.length / 8; i < len; ++i) {
        result.push(i + 1);
      }
      return result;
    }

    public cancel(): void {
      this.apps = this.myapps.apps.concat();
      this.pages = this.createPages();
      this.dataChanged = false;
    }

    public save(): void {
      var data: string[] = this.apps.map((app) => { return app.appid; });
      this.bentoWebApi.putMyApps({
        apps: data
      }).then((res: IResult) => {
        this.$log.info('MyApps saved.');
        this.myapps.apps = this.apps.concat();
        this.dataChanged = false;
      }, (err: any) => {
        this.$log.warn('Fail to MyApps save.');
      });
    }

    public deleteApp(index: number): void {
      this.apps.splice(index, 1);
      if (this.apps.length % this.pageCount === 0) {
        this.pages = this.createPages();
      }
      this.dataChanged = true;
    }
  }

}

angular.module('bws.controllers.app', [])
  .controller('AppHeaderController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    bwsUtil: bws.services.BwsUtil
  ) => new bws.controllers.AppHeaderController($scope, $log, bwsUtil))
  .controller('AppStoreController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $location: ng.ILocationService,
    $timeout: ng.ITimeoutService,
    bentoWebApi: bws.services.BentoWebApi,
    appList: bws.IAppCategory
  ) => new bws.controllers.AppStoreController($scope, $log, $location, $timeout, bentoWebApi, appList))
  .controller('AppDetailController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $location: ng.ILocationService,
    $timeout: ng.ITimeoutService,
    bentoWebApi: bws.services.BentoWebApi,
    info: bws.IAppInfo
  ) => new bws.controllers.AppDetailController($scope, $log, $location, $timeout, bentoWebApi, info))
  .controller('MyAppsController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $location: ng.ILocationService,
    bentoWebApi: bws.services.BentoWebApi,
    myapps: bws.IMyApps
  ) => new bws.controllers.MyAppsController($scope, $log, $location, bentoWebApi, myapps))
;

