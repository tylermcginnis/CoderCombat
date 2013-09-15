angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', ['$scope', 'socket', '$modal', function ($scope, socket, $modal) {
    $scope.partnerModal = function() {
      var modal = $modal({
        template: '../../views/pairing-modal.html',
        show: true,
        backdrop: 'static',
        scope: $scope
      });
    };
    socket.on('join', function (room) {
        socket.emit('init', room);
    });
}]);
