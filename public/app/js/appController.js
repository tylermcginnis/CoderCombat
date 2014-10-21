var app = angular.module('CC');
app.controller('mainCtrl', function($scope, socket, $timeout, initiateEditor, $modalStack){
  var closeAllModals = function(){
    socket.emit('closeLoserModal');
    $modalStack.dismissAll();
  }

  $scope.data = {};

  $scope.checkAnswer = function(){
    if(initiateEditor.validateCode($scope.returnEditorText())){
      $modalStack.dismissAll();
      socket.emit('showWinnerModal');
      socket.emit('clearAllEditors');
      socket.emit('showLoserModal');
      $timeout(function(){
        closeAllModals();
        socket.emit('initializeNewQuestion');
      }, 5000);
    } else {
      alert('wrong')
    }
  };

  socket.on('joinedRoom', function(obj){
    closeAllModals();
    console.log('New player joined the room');
  });

  socket.on('leftRoom', function(obj){
    console.log('someone left the room')
  });
});