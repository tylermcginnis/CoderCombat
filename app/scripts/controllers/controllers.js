angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', ['$scope', 'socket', '$modal', function ($scope, socket, $modal) {
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