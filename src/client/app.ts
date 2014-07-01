///<reference path="../../def/angularjs/angular.d.ts" />
///<reference path="../../def/angularjs/angular-route.d.ts" />
///<reference path="../../def/angular-ui/angular-ui-router.d.ts" />
///<reference path="../../def/angular-ui-bootstrap/angular-ui-bootstrap.d.ts" />
///<reference path="../../def/types.d.ts" />
///<reference path="./services.ts" />


angular.module('jrpc', [
  'ngAnimate',
  'ngRoute',
  'ui.ace',
  'ui.bootstrap',
  'ui.event',
  'ui.router',
  'jrpc.services',
  'jrpc.controllers.config',
  'jrpc.controllers.log'
])
.config(($stateProvider: ng.ui.IStateProvider, $routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $routeProvider
    .when('/', { redirectTo: "/config" })
    .otherwise({ redirectTo: "/config" });
  $stateProvider
    .state('config', {
      url: '/config',
      templateUrl: 'config/config-list.tpl.html',
      controller: 'ConfigListController as config',
      resolve: {
        list: ['jrpcWebApi', (jrpcWebApi: jrpc.services.JrpcWebApi): ng.IPromise<jrpc.IMethodList> => {
          return jrpcWebApi.getMethods();
        }]
      }
    })
    .state('config.detail', {
      url: '/detail/:name',
      views: {
        body: {
          templateUrl: 'config/config-detail.tpl.html',
          controller: 'ConfigDetailController as detail'
        }
      }
    })
    .state('log', {
      url: '/log',
      templateUrl: 'log/log.tpl.html',
      controller: 'AccessLogController as alog',
      resolve: {
        log: ['jrpcWebApi', (jrpcWebApi: jrpc.services.JrpcWebApi): ng.IPromise<jrpc.ILogResult> => {
          return jrpcWebApi.getAccessLog();
        }]
      }
    });
});

