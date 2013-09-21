angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', ['$scope', 'socket', '$modal', 'httpConnect', function ($scope, socket, $modal, httpConnect) { 
    var questionObj = {};
    var answer;
    var parameter;
    httpConnect.connect()
        .success(function(data, status){
          var rnd = Math.floor(Math.random() * data.length-1) + 1;
          questionObj.title = data[rnd].title;
          questionObj.challenge = data[rnd].question;
          questionObj.parameter = data[rnd].parameter;
          questionObj.answer = data[rnd].answer;
        }).error(function(data, status){
          console.log("An error occured on httpConnect");
        });
    socket.on('updateQuestion', function(questionObj){
      $scope.challenge = questionObj.challenge;
      $scope.title = questionObj.title;
      answer = questionObj.answer;
      parameter = questionObj.parameter;
    });
    socket.on('join', function (room) {
        socket.emit('init', room);
    });
    socket.on('oppDisconnect', function(){
      $modal({
        template: '../../views/disconnect-modal.html',
        keyboard: false,
        scope: $scope
      });
      socket.emit('connection');
    });
    socket.on('modalStart', function(){
      $modal({
        template: '../../views/pairing-modal.html',
        keyboard: false,
        scope: $scope
      });
    });
    socket.on('modalEnd', function(){
      if($scope.$modal){
        $scope.$modal('hide');
      }
      socket.emit('sendQuestion', questionObj);
    });

    $scope.evaluateCode = function(){
      var editor = ace.edit('leftEditor');
      var userAnswer = editor.getSession().getValue();
      userAnswer = userAnswer.split("");
      userAnswer.unshift('(');
      userAnswer.push('(' + "'" + parameter + "'" + ')'+ ')');
      userAnswer = userAnswer.join("");
      var result = eval(userAnswer);
      if(result === answer){ //emit to both parties that whoever submitted won
        alert('You were correct!');
      } else{ //emit to just who submitted it that they were wrong
        alert('You were wrong!');
      }
    }
}]);