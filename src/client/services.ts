///<reference path="../../def/angularjs/angular.d.ts" />
///<reference path="../../def/x2js/xml2json.d.ts" />
///<reference path="../../def/decarta/js4.d.ts" />
///<reference path="../../def/types.d.ts" />


module jrpc.services {

  export class JrpcWebApi {
    constructor(private $http: ng.IHttpService, private $log: ng.ILogService) {}

    public getMethods(): ng.IPromise<IMethodList> {
      return this.wrap(this.$http.get('/api/method'));
    }
    public updateMethod(data: jrpc.IJsonRpcMethod): ng.IPromise<IResult> {
      return this.wrap(this.$http.post('/api/method/' + data.name, data));
    }
    public deleteMethod(name: string): ng.IPromise<IResult> {
      return this.wrap(this.$http.delete('/api/method/' + name, {}));
    }

    public getAccessLog(): ng.IPromise<ILogResult> {
      return this.wrap(this.$http.get('/api/log/access'));
    }

    private wrap<T>(data: ng.IHttpPromise<T>): ng.IPromise<T> {
      return data.then((arg: ng.IHttpPromiseCallbackArg<T>) => {
        return arg.data;
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

}

angular.module('jrpc.services', [])
  .factory('jrpcWebApi', ($http: ng.IHttpService, $log: ng.ILogService) => new jrpc.services.JrpcWebApi($http, $log))
  .factory('jrpcUtil', ($location: ng.ILocationService, $log: ng.ILogService) => new jrpc.services.BwsUtil($location, $log))
;


