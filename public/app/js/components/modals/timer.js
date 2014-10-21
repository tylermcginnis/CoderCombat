var app = angular.module('CC');

app.directive('timer', function($interval){
  return {
    restrict: 'E',
    link: function(scope, ele, attrs){
        $interval(function(){
          ele.html(parseInt(ele.html() -1, 10));
        }, 1000);
    }
  }
})