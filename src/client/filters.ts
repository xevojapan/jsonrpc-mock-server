///<reference path="../../def/angularjs/angular.d.ts" />
///<reference path="../../def/moment/moment.d.ts" />
///<reference path="../../def/types.d.ts" />

module bws.filters {

  export function getUserStatusClass(lastUpdated: string): string {
    var className = (b: boolean) => b ? 'online' : 'offline';

    var m = moment(lastUpdated);
    if (!m) {
      return className(false);
    }
    var pivot = moment().add('minutes', -30);
    return className(m.isAfter(pivot));
  }
}

angular.module('bws.filters', [])
  .filter('userStatus', () => bws.filters.getUserStatusClass);

