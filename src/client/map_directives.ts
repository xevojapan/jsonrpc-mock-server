///<reference path="../../def/angularjs/angular.d.ts" />
///<reference path="../../def/decarta/js4.d.ts" />


module bws.directives.map {

  function bindMapEvents(scope: ng.IScope, eventsStr: string, deCartaObject: any, element: any) {
    angular.forEach(eventsStr.split(' '), function (eventName: string) {
      deCarta.Core.EventManager.listen(eventName, (event: any): void => {
        element.triggerHandler('decarta-' + eventName, event);
        if (!scope.$$phase) {
          scope.$apply();
        }
      }, deCartaObject);
    });
  }

  export function createMapOverlayDirective(app: ng.IModule, directiveName: string, events: string) {
    app.directive(directiveName, () => new decartaUiMapOverlay(directiveName, events));
  }

  export class decartaUiMapOverlay implements ng.IDirective {
    constructor(public directiveName: string, public events: string) {}

    public restrict = 'A';
    public link = (function(self: decartaUiMapOverlay) {
      return (scope: ng.IScope, elem: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any): void => {
        scope.$watch(attrs[self.directiveName], (newObject) => {
          if (newObject) {
            bindMapEvents(scope, self.events, newObject, elem);
          }
        });
      };
    }(this));
  }

  export class decartaUiMap implements ng.IDirective {
    private initialized = false;
    private mapEvents = 'click doubleclick longtouch move moveend movestart ' +
                        'resize rightclick viewchange zoomchange zoomend zoomstart';

    constructor(private $parse: ng.IParseService, private $log: ng.ILogService) {
      this.initializeDeCartaConfig();
    }
    private initializeDeCartaConfig() {
      if (!this.initialized) {
        deCarta.Core.Configuration.AppKey = Config.AppKey;
        this.initialized = true;
      }
    }

    public restrict = 'A';
    public link = (function(self: decartaUiMap) {
      return (scope: ng.IScope, elem: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any): void => {
        var id = elem[0].id;
        if (!id) {
          this.$log.error('deCarta map required id attributes.');
          return;
        }
        var opts = angular.extend({
          id: id
        }, scope.$eval(attrs['uiOptions']));

        var map = new deCarta.Core.Map(opts);
        var model = self.$parse(attrs['uiDecarta']);

        model.assign(scope, map);
        bindMapEvents(scope, self.mapEvents, map, elem);
      };
    }(this));
  }

}


var app = angular.module('bws.directives.map', ['ui.event']);
app.directive('uiDecarta', ($parse: ng.IParseService, $log: ng.ILogService) => new bws.directives.map.decartaUiMap($parse, $log));

bws.directives.map.createMapOverlayDirective(app, 'uiDecartaPin', 'click doubleclick longtouch move moveend movestart rightclick');
bws.directives.map.createMapOverlayDirective(app, 'uiDecartaPolyline', 'click doubleclick longtouch move moveend movestart rightclick');
bws.directives.map.createMapOverlayDirective(app, 'uiDecartaPolygon', 'click doubleclick longtouch move moveend movestart rightclick');
bws.directives.map.createMapOverlayDirective(app, 'uiDecartaCircle', 'click doubleclick longtouch move moveend movestart rightclick');
bws.directives.map.createMapOverlayDirective(app, 'uiDecartaImage', 'click doubleclick longtouch move moveend movestart rightclick');

