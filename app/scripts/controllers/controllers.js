angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', ['$scope', 'socket', '$modal', function ($scope, socket, $modal) {
    $scope.challenge = 'Using the JavaScript language, have the function LetterChanges(str) 
    take the str parameter being passed and modify it using the following algorithm. 
    Replace every letter in the string with the letter following it in the alphabet 
    (ie. c becomes d, z becomes a).Then capitalize every vowel in this new string 
    (a, e, i, o, u) and finally return this modified string. ';
    
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