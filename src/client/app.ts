///<reference path="../../def/angularjs/angular.d.ts" />
///<reference path="../../def/angularjs/angular-route.d.ts" />
///<reference path="../../def/angular-ui-bootstrap/angular-ui-bootstrap.d.ts" />
///<reference path="../../def/types.d.ts" />
///<reference path="./services.ts" />


angular.module('bws', [
  'ngAnimate',
  'ngRoute',
  'ui.event',
  'ui.bootstrap',
  'ui.sortable',
  'angularSmoothscroll',
  'bws.directives',
  'bws.directives.map',
  'bws.filters',
  'bws.services',
  'bws.controllers',
  'bws.controllers.login',
  'bws.controllers.top',
  'bws.controllers.info',
//  'bws.controllers.hist',
  'bws.controllers.navi',
  'bws.controllers.app',

  'ngResource',
  'pascalprecht.translate',
  'ui.calendar',
  'ui.map',
  'dl.filters',
  'dl.modal',
  'dl.security.service',
  'dl.services',
  'dl.past',
])
.config(($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $routeProvider
    .when('/', {
      templateUrl: 'top/top.tpl.html',
      controller: 'TopController',
      controllerAs: 'top'
    })
    .when('/login', {
      templateUrl: 'login/login.tpl.html',
      controller: 'LoginController',
      controllerAs: 'login'
    })
    .when('/info', {
      templateUrl: 'info/info.tpl.html',
      controller: 'CarInfoController',
      controllerAs: 'info'
    })
    .when('/history', {
      resolve: {
        userId: ['$location', 'bentoWebApi', ($location: ng.ILocationService, bentoWebApi: bws.services.BentoWebApi): ng.IPromise<string> => {
          return bentoWebApi.getDrivelyticsUserInfo().then(function(data) {
            $location.path("/history/" + data.user.id);
            return data.user.id;
          });
        }]
      }
    })
    .when('/history/:userId', {
      templateUrl: 'hist/past-detail.tpl.html',
      controller: 'PastCtrl',
      reloadOnSearch: false
    })
    .when('/navigation', {
      templateUrl: 'navi/navi.tpl.html',
      controller: 'NaviController',
      controllerAs: 'navi',
      reloadOnSearch: false
    })
    .when('/app', {
      redirectTo: "/app/"
    })
    .when('/app/', {
      templateUrl: 'app/appstore.tpl.html',
      controller: 'AppStoreController',
      controllerAs: 'appstore',
      resolve: {
        appList: ['bentoWebApi', (bentoWebApi: bws.services.BentoWebApi): ng.IPromise<bws.IAppCategory> => {
          return bentoWebApi.getAppstoreList();
        }]
      }
    })
    .when('/app/detail/:appid', {
      templateUrl: 'app/detail.tpl.html',
      controller: 'AppDetailController',
      controllerAs: 'detail',
      resolve: {
        info: ['$route', 'bentoWebApi', ($route: ng.route.IRouteService, bentoWebApi: bws.services.BentoWebApi): ng.IPromise<bws.IAppInfo> => {
          return bentoWebApi.getAppInfo($route.current.params.appid);
        }]
      }
    })
    .when('/app/myapps', {
      templateUrl: 'app/myapps.tpl.html',
      controller: 'MyAppsController',
      controllerAs: 'myapp',
      resolve: {
        myapps: ['bentoWebApi', (bentoWebApi: bws.services.BentoWebApi): ng.IPromise<bws.IMyApps> => {
          return bentoWebApi.getMyApps();
        }]
      }
    })
    .otherwise({
      redirectTo: "/"
    });
})
.config(($translateProvider: any) => {
  $translateProvider.useStaticFilesLoader({
    prefix: '/static/i18n/locale-',
    suffix: '.json'
  });
  $translateProvider.preferredLanguage('en');
  $translateProvider.useMissingTranslationHandlerLog();
});




// for diabling ui.bootstrap. via http://stackoverflow.com/questions/20137900/controller-carousel-required-by-directive-ngtransclude-cant-be-found
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
  .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function($scope: ng.IScope, $timeout: ng.ITimeoutService, $transition: ng.ui.bootstrap.ITransitionService, $q: ng.IQService) {
  }]).directive('carousel', [function() {
    return {};
  }]);

