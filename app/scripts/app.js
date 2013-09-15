angular.module('CoderCombatApp', ['CoderCombatApp.controllers', 'CoderCombatApp.directives', 'CoderCombatApp.services', '$strap.directives'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/challengePage.html',
        controller: 'mainCntrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
