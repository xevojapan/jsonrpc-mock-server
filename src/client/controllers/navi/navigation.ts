///<reference path="../../../../def/angularjs/angular.d.ts" />
///<reference path="../../../../def/decarta/js4.d.ts" />
///<reference path="../../../../def/types.d.ts" />

module bws.controllers {

  export class NaviController {
    public hideMenu = false;

    public map: deCarta.Core.Map;
    public mapOptions: any;
    public overlay: deCarta.Core.MapOverlay;
    public pins: deCarta.Core.Pin[] = [];

    public params: { t?: string; c?: string; };
    public template: string;

    constructor(
        private $scope: ng.IScope,
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private rooneyApi: bws.services.RooneyApi)
    {
      var center = new deCarta.Core.Position(42.4880075, -83.5029471);
      this.overlay = new deCarta.Core.MapOverlay({
        name: "pins"
      });
      this.mapOptions = {
        zoom: 14,
        center: center,
        controls: [
          new deCarta.UI.ZoomControl({ position: 'rightTop' }),
          new deCarta.UI.LayerControl({ position: 'topRight' }),
          new deCarta.UI.ScaleControl({ position: 'bottomLeft' })
        ],
        onReady: (map: deCarta.Core.Map) => {
          map.addLayer(this.overlay);
          map.render();
        }
      };

      this.checkParam();
      $scope.$on('$routeUpdate', () => {
        this.checkParam();
      });
    }

    public toggleMenuShown(): void {
      this.hideMenu = !this.hideMenu;

      var resize = () => {
        var center = this.map.getCenter();
        this.map.resize();
        this.map.centerOn(center);
      };
      this.$timeout(() => {
        if (this.hideMenu) {
          angular.element('#navigation_map').width($(window).width());
        } else {
          angular.element('#navigation_map').width('');
        }
        resize();
        this.$timeout(() => {
          resize();
        }, 100);
      }, 100);
    }

    public checkParam(): void {
      this.params = this.$location.search();
      this.template = this.getTemplateFile(this.params.t);
      if (this.template === null) {
        this.go('search');
      }
      if (this.params.t === 'cdetail' && !this.params.c) {
        this.go('cdetail', 'gas');
      }
    }

    public go(type: string, category?: string): void {
      var param: { t: string; c?: string; } = { t: type };
      if (category) {
        param.c = category;
      }
      this.$location.search(param);
      this.clearPins();
    }

    private getTemplateFile(type: string): string {
      switch (type) {
        case 'clist':
          return 'navi/category_list.tpl.html';
        case 'cdetail':
          return 'navi/category_detail.tpl.html';
        case 'fav':
          return 'navi/favorites.tpl.html';
        case 'hist':
          return 'navi/history.tpl.html';
        case 'search':
          return 'navi/search.tpl.html';
        default:
          return null;
      }
    }

    public getCategoryName(category: string): string {
      switch (category) {
        case 'airport': return 'Airport';
        case 'atm': return 'ATM';
        case 'bar': return 'Bar';
        case 'coffee': return 'Coffee';
        case 'department': return 'Department';
        case 'gas': return 'Gas';
        case 'hospital': return 'Hospital';
        case 'hotel': return 'Hotel';
        case 'movie': return 'Movie';
        case 'parking': return 'Parking';
        case 'restaurant': return 'Restaurant';
      }
    }

    public setPins(pins: deCarta.Core.Pin[]): void {
      this.pins = pins;
      var positions: deCarta.Core.Position[] = [];
      pins.forEach((pin) => {
        this.overlay.addObject(pin);
        positions.push(pin.getCenter());
      });
      var bounds = new deCarta.Core.BoundingBox(positions);
      var ideal = bounds.getIdealCenterAndZoom(this.map);
      this.map.zoomTo(ideal.zoom);
      this.map.centerOn(ideal.center);
    }
    public clearPins(): void {
      this.pins = [];
      if (this.map) {
        this.overlay.clear();
        this.map.render();
      }
    }

    public selectPin(pin: deCarta.Core.Pin): void {
      var index = this.pins.indexOf(pin);
      this.$scope.$broadcast('selectPin', index);
    }
    public closeInfoWindow(index: number): void {
      var pin = this.pins[index];
      if (pin) {
        pin.getInfoWindow().hide();
      }
    }
  }

  export class NaviListBaseCntroller {
    public list: INaviPoi[] = [];
    private navi: NaviController;

    private alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private useAlphabet = true;

    constructor(
      private $myScope: any,
      private $myLog: ng.ILogService,
      private $myCompile: ng.ICompileService,
      private myRooneyApi: bws.services.RooneyApi,
      private contName: string)
    {
      this.navi = $myScope.navi;
      this.$myScope.$on('selectPin', (event: ng.IAngularEvent, index: number) => {
        this.setSelected(index);
      });
    }

    public setDecartaList(list: IDecartaPoi[]) {
      this.useAlphabet = true;
      this.clearPins();
      if (!list) {
        return;
      }
      if (!angular.isArray(list)) {
        list = <IDecartaPoi[]>[list];
      }
      var l: INaviPoi[] = [];
      list.forEach((row) => {
        l.push({
          id: row.id,
          name: row.poi.name,
          address: row.address.freeformAddress,
          lat: row.position.lat,
          lon: row.position.lon
        });
      });
      this.list = l;
      this.showPins();
    }
    public setRooneyList(list: IRooneyPoi[], fav: boolean) {
      this.useAlphabet = false;
      this.clearPins();
      if (!list) {
        return;
      }
      if (!angular.isArray(list)) {
        list = <IRooneyPoi[]>[list];
      }
      var l: INaviPoi[] = [];
      list.forEach((row) => {
        l.push({
          id: row['poi-id'],
          name: row.name,
          address: row.address,
          lat: row.lat,
          lon: row.lon,
          fav: fav,
          favId: row['favorite-id']
        });
      });
      this.list = l;
      this.showPins();
    }

    private showPins(): void {
      var pins: deCarta.Core.Pin[] = [];
      this.list.forEach((item, index) => {
        var iw = new deCarta.Core.InfoWindow(this.navi.map);
        var dom = iw.getElement();
        var elementId = 'infowindow_popup_' + index;
        var pinLiteral = this.contName + '.list[' + index + ']';
        dom.innerHTML =
          '<div id="' + elementId + '" class="map_pop_box">'
          + '<h1>' + item.name + '</h1>'
          + '<p class="map_address">' + item.address + '</p>'
          + '<button class="btn btn_add_fav" data-btn-checkbox data-ng-model="' + pinLiteral + '.fav" data-ng-click="' + this.contName + '.switchFav(' + pinLiteral + ')" data-ng-disabled="' + pinLiteral + '.updating">'
            + '<i class="fav glyphicon glyphicon-star" data-ng-hide="' + pinLiteral + '.updating"></i>'
            + '<i class="fav fa fa-spin fa-spinner" data-ng-show="' + pinLiteral + '.updating"></i>'
            + '<span class="add_fav">Add to favorite</span>'
            + '<span class="added_fav">Added</span>'
          + '</button>'
          + '<p class="btn_map_close"><a data-ng-click="navi.closeInfoWindow(' + index + ')"><img class="close" src="/static/img/btn_close_window.png"></a></p>'
          + '</div>';
        var prop = this.getPinImage(index, false);
        var opts = {
          position: new deCarta.Core.Position(item.lat, item.lon),
          text: item.name,
          infoWindow: iw,
          onTextShown: (self: deCarta.Core.InfoWindow) => {
            if (self.options._init) {
              return;
            }
            var compile = (): void => {
              this.$myCompile(document.getElementById(elementId))(this.$myScope);
            };
            if (this.$myScope.$$phase) {
              compile();
            } else {
              this.$myScope.$apply(compile);
            }
            self.options._init = true;
          },
          image: prop.image,
          xOffset: prop.x,
          yOffset: prop.y
        };
        var pin = new deCarta.Core.Pin(opts);
        pins.push(pin);
      });
      this.navi.setPins(pins);
    }

    private clearPins(): void {
      this.navi.clearPins();
    }

    public setSelected(index: number): void {
      this.list.forEach((item, i) => {
        var newVal = i === index;
        var pin = this.navi.pins[i];
        if (!newVal) {
          pin.hideText();
        }
        if (newVal !== item.selected) {
          item.selected = newVal;
          var prop = this.getPinImage(i, newVal);
          pin.domElement.innerHTML = '';
          pin.setImage(prop.image, prop.x, prop.y);
          if (newVal) {
            this.navi.map.centerOn(pin.getCenter());
            pin.showText();
          }
        }
      });
    }
    private getPinImage(index: number, selected: boolean): { image: HTMLElement; x: number; y: number; } {
      var className = this.useAlphabet ?
                        selected ? 'map_pin_number_selected' : 'map_pin_number_normal'
                      : selected ? 'map_pin_dot_selected' : 'map_pin_dot_normal';
      var div = angular.element('<div class="map_pin ' + className + '">' + (this.useAlphabet ? this.getListPinNumber(index) : '') +'</div>');
      var offset = selected ? 8 : 6;
      return {
        image: div.get(0),
        x: offset,
        y: offset
      };
    }

    public getListPinNumber(index: number): string {
      return this.alphabets[index % this.alphabets.length];
    }

    public switchFav(poi: INaviPoi): void {
      if (poi.fav) {
        poi.updating = true;
        this.myRooneyApi.deleteFavorite(poi.favId).then((data) => {
          poi.fav = false;
          poi.updating = false;
          this.$myLog.debug('unfav success: fav-id=' + poi.favId);
        }, (err) => {
          poi.fav = true;
          poi.updating = false;
          this.$myLog.warn('unfav error: ' + err);
        });
      } else {
        var param = {
          poi_id: poi.id,
          name: poi.name,
          address: poi.address,
          lat: poi.lat,
          lon: poi.lon
        };
        poi.updating = true;
        this.myRooneyApi.addFavorite(param).then((data: { response: IRooneyPoi; }) => {
          poi.fav = true;
          poi.updating = false;
          poi.favId = data.response['favorite-id'];
          this.$myLog.debug('fav success: fav-id=' + poi.favId);
        }, (err) => {
          poi.fav = false;
          poi.updating = false;
          this.$myLog.warn('fav error: ' + err);
        });
      }
    }
  }

  export class NaviSearchController extends NaviListBaseCntroller {
    public query: string;
    public loading = false;

    constructor(
      private $scope: any,
      private $log: ng.ILogService,
      private $compile: ng.ICompileService,
      private rooneyApi: bws.services.RooneyApi)
    {
      super($scope, $log, $compile, rooneyApi, 'search');
    }

    public execute(): void {
      var navi: NaviController = this.$scope.navi;
      var center = navi.map.getCenter();

      this.loading = true;
      this.rooneyApi.getPoiSearch(this.query, { lat: center.getLat(), lon: center.getLon(), radius: 100000 }).then((data: IRooney<IDecartaPoiList>) => {
        this.setDecartaList(data.response.result.results.result);
        this.loading = false;
      }, (err) => {
        this.loading = false;
      });
    }
  }

  export class NaviCategoryDetailController extends NaviListBaseCntroller {
    constructor(
      private $scope: any,
      private $log: ng.ILogService,
      private $compile: ng.ICompileService,
      private rooneyApi: bws.services.RooneyApi)
    {
      super($scope, $log, $compile, rooneyApi, 'detail');

      var navi: NaviController = $scope.navi;
      var params = navi.params;
      var center = navi.map.getCenter();
      rooneyApi.getPoiSearch(params['c'], { lat: center.getLat(), lon: center.getLon(), radius: 100000 }).then((data: IRooney<IDecartaPoiList>) => {
        this.setDecartaList(data.response.result.results.result);
      });
    }
  }

  export class NaviFavController extends NaviListBaseCntroller {
    public loading = true;

    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $compile: ng.ICompileService,
      private rooneyApi: bws.services.RooneyApi)
    {
      super($scope, $log, $compile, rooneyApi, 'fav');

      rooneyApi.getFavorites().then((data: IRooney<IRooneyPoiList>) => {
        this.setRooneyList(data.response.result.result, true);
        this.loading = false;
      });
    }
  }

  export class NaviHistController extends NaviListBaseCntroller {
    constructor(
      private $scope: ng.IScope,
      private $log: ng.ILogService,
      private $compile: ng.ICompileService,
      private rooneyApi: bws.services.RooneyApi)
    {
      super($scope, $log, $compile, rooneyApi, 'hist');

      rooneyApi.getHistory().then((data: IRooney<IRooneyPoiList>) => {
        this.setRooneyList(data.response.result.result, false);
      });
    }
  }
}

angular.module('bws.controllers.navi', [])
  .controller('NaviController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $location: ng.ILocationService,
    $timeout: ng.ITimeoutService,
    rooneyApi: bws.services.RooneyApi
  ) => new bws.controllers.NaviController($scope, $log, $location, $timeout, rooneyApi))
  .controller('NaviSearchController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $compile: ng.ICompileService,
    rooneyApi: bws.services.RooneyApi
  ) => new bws.controllers.NaviSearchController($scope, $log, $compile, rooneyApi))
  .controller('NaviCategoryDetailController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $compile: ng.ICompileService,
    rooneyApi: bws.services.RooneyApi
  ) => new bws.controllers.NaviCategoryDetailController($scope, $log, $compile, rooneyApi))
  .controller('NaviFavController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $compile: ng.ICompileService,
    rooneyApi: bws.services.RooneyApi
  ) => new bws.controllers.NaviFavController($scope, $log, $compile, rooneyApi))
  .controller('NaviHistController', (
    $scope: ng.IScope,
    $log: ng.ILogService,
    $compile: ng.ICompileService,
    rooneyApi: bws.services.RooneyApi
  ) => new bws.controllers.NaviHistController($scope, $log, $compile, rooneyApi))
;

