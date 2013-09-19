angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', ['$scope', 'socket', '$modal', 'httpConnect', function ($scope, socket, $modal, httpConnect) { 
    httpConnect.connect()
        .success(function(data, status){
          var rnd = Math.floor(Math.random() * data.length-1) + 1;
          $scope.challenge = data[rnd].question;
        }).error(function(data, status){
          console.log("An error occured on httpConnect");
        });
    socket.on('join', function (room) {
        socket.emit('init', room);
    });
    socket.on('modalStart', function(){
      $modal({
        template: '../../views/pairing-modal.html',
        show: true,
        keyboard: false,
        scope: $scope
      });
    });
    socket.on('modalEnd', function(){
      //END THAT MODAL ABOVE
    })
}]);