angular.module('CoderCombatApp.services', [])
    .factory('socket', function($rootScope){
      var socket = io.connect(); //should be io.connect(http://localhost)?
      return {
        on: function(eventName, callback){
          socket.on(eventName, function(){
            var args = arguments;
            $rootScope.safeApply(function(){
              callback.apply(socket, args);
            });
          });
        },
        emit: function(eventName, data, callback){
          socket.emit(eventName, data, function(){
            var args = arguments;
          });
          $rootScope.safeApply(function(){
            if(callback){
              callback.apply(socket, args);
            }
          });
        }
      }
    })
    .factory('httpConnect', ['$http', function($http){
      var makeRequest = function(){
        return $http({
            method: 'GET',
            url: 'http://localhost:3000/getQuestion'
        });
      }
      return {
        connect : function(){return makeRequest()}
      }
    }]);