///<reference path="../../def/angularjs/angular.d.ts" />

module bws.directives {

  export class ReviewStar implements ng.IDirective {
    public restrict = 'A';
    public link(scope: ng.IScope, elem: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any): void {
      var rate = attrs['reviewStar'];

      elem.addClass('star_average_area');
      var inner = '';
      for (var i = 0; i < 5; ++i) {
        var cls = rate > 0.5 ? 'star_on' : rate > 0 ? 'star_half' : 'star_off';
        inner += '<i class="star_average ' + cls + '"></i>';
        rate -= 1;
      }
      elem.html(inner);
    }
  }

}

angular.module('bws.directives', [])
  .directive('reviewStar', () => new bws.directives.ReviewStar());

