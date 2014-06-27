///<reference path="../../def/angularjs/angular.d.ts" />
///<reference path="../../def/x2js/xml2json.d.ts" />
///<reference path="../../def/decarta/js4.d.ts" />
///<reference path="../../def/types.d.ts" />


module bws.services {

  export class BentoWebApi {
    constructor(private $http: ng.IHttpService, private $log: ng.ILogService) {}

    public login(email: string, password: string): ng.IPromise<IResult> {
      return this.wrap(this.$http.post('/auth/login', {
        email: email, password: password
      }));
    }
    public logout(): ng.IPromise<IResult> {
      return this.wrap(this.$http.post('/auth/logout', {}));
    }

    public getAppstoreList(): ng.IPromise<IAppCategory> {
      return this.wrap(this.$http.get('/api/appstore/list'));
    }
    public getAppInfo(appid: string): ng.IPromise<IAppInfo> {
      return this.wrap(this.$http.get('/api/appinfo/' + appid));
    }
    public getMyApps(): ng.IPromise<IMyApps> {
      return this.wrap(this.$http.get('/api/userapps/myapps'));
    }
    public putMyApps(apps: IUpdateApps): ng.IPromise<IResult> {
      return this.wrap(this.$http.put('/api/userapps/myapps', apps));
    }
    public installApp(appid: string): ng.IPromise<IResult> {
      return this.wrap(this.$http.post('/api/userapps/install/' + appid, {}));
    }
    public uninstallApp(appid: string): ng.IPromise<IResult> {
      return this.wrap(this.$http.delete('/api/userapps/install/' + appid, {}));
    }
    public getDrivelyticsUserInfo(): ng.IPromise<{ user: { id: string; } }> {
      return this.wrap(this.$http.get('/api/drivelytics/userinfo'));
    }

    private wrap<T>(data: ng.IHttpPromise<T>): ng.IPromise<T> {
      return data.then((arg: ng.IHttpPromiseCallbackArg<T>) => {
        return arg.data;
      });
    }
  }

  export class RooneyApi {
    private x2js = new X2JS();

    constructor(private $http:ng.IHttpService, private $log:ng.ILogService) {}

    public getPoiSearch(query: string, param: Object): ng.IPromise<IRooney<IDecartaPoiList>> {
      return this.wrap(this.$http.get('/api/rooney/decarta_rest/poi/' + encodeURIComponent(query), { params: param }));
    }
    public getFavorites(): ng.IPromise<IRooney<IRooneyPoiList>> {
      return this.wrap(this.$http.get('/api/rooney/poi_list'));
    }
    public getHistory(): ng.IPromise<IRooney<IRooneyPoiList>> {
      return this.wrap(this.$http.get('/api/rooney/history/list'));
    }
    public addFavorite(param: Object): ng.IPromise<{ response: IRooneyPoi }> {
      return this.wrap(this.$http.post('/api/rooney/poi/', jQuery.param(param), { headers: { 'Content-Type': undefined } }));
    }
    public deleteFavorite(favId: number): ng.IPromise<{ response: { message: string; }}> {
      return this.wrap(this.$http.post('/api/rooney/poi/' + favId + '/delete', "", { headers: { 'Content-Type': undefined } }));
    }

    private wrap<T>(data: ng.IHttpPromise<string>): ng.IPromise<T> {
      return data.then((arg: ng.IHttpPromiseCallbackArg<string>) => {
        return this.x2js.xml_str2json(arg.data);
      });
    }
  }

  export class BwsUtil {
    constructor(private $location: ng.ILocationService, private $log: ng.ILogService) {}

    public checkPath(path: string, level: number = 1): boolean {
      var p = this.$location.path().split('/')[level];
      return path === p;
    }
  }

  export class MapHelper {
    constructor(private $timeout: ng.ITimeoutService, private $log: ng.ILogService) {}

    public createDefaultMapOption(zoom: number = 12, infomation: any = '', ready: (map: deCarta.Core.Map) => void = null) {
      var center = new deCarta.Core.Position(42.4880075, -83.5029471);
      return {
        zoom: zoom,
        center: center.clone(),
        scrollWheelEnabled: false,
        onReady: (map: deCarta.Core.Map) => {
          var overlay = new deCarta.Core.MapOverlay({ name: 'pinView' });
          map.addLayer(overlay);

          var pin = this.createPin(center.clone(), infomation);
          overlay.addObject(pin);

          map.render();
          this.$timeout(() => {
            pin.showText();
            if (ready) {
              ready(map);
            }
          }, 100);
        }
      };
    }

    private createPin(center: deCarta.Core.Position, infomation: any): deCarta.Core.Pin {
      return new deCarta.Core.Pin({
        position: center,
        text: infomation,
        imageSrc: '/static/img/icon_real_car.png',
        yOffset: 36,
        xOffset: 36
      });
    }
  }

}

angular.module('bws.services', [])
  .factory('bentoWebApi', ($http: ng.IHttpService, $log: ng.ILogService) => new bws.services.BentoWebApi($http, $log))
  .factory('rooneyApi', ($http: ng.IHttpService, $log: ng.ILogService) => new bws.services.RooneyApi($http, $log))
  .factory('bwsUtil', ($location: ng.ILocationService, $log: ng.ILogService) => new bws.services.BwsUtil($location, $log))
  .factory('mapHelper', ($timeout: ng.ITimeoutService, $log: ng.ILogService) => new bws.services.MapHelper($timeout, $log))
;


