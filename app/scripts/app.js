angular.module('CoderCombatApp', ['CoderCombatApp.controllers', 'CoderCombatApp.directives', 'CoderCombatApp.services', '$strap.directives'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/challengePage.html',
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$rootScope', function($rootScope) {
    $rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
          if(fn && (typeof(fn) === 'function')) {
              fn();
          }
      } else {
          this.$apply(fn);
        }
    };
  }]);;

//Todo Thursday
//Figure out what to do when someone 'disconnects' from the room
//Make sure the 'room' has the same problem. Pause a bit on start?
//Add font, perfect design
//Figure out how to evaluate code and declare a winner (When you get to this break it up more)