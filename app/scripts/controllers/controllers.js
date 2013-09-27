angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', [
    '$scope', 
    'socket', 
    '$modal', 
    'httpConnect',
    'countdown',
    function ($scope, socket, $modal, httpConnect, countdown) { 
      var questionObj = {};
      var answer;
      var parameter;

      httpConnect.connect()
          .success(function(data, status){
            console.log('HttpConnection Made')
            questionObj = data;
          }).error(function(data, status){
            console.log("An error occured on httpConnect");
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
      });

      socket.on('modalStart', function(){
        $modal({
          template: '../../views/pairing-modal.html',
          keyboard: false,
          scope: $scope
        });
      });

      socket.on('modalEnd', function(rand){
        if(rand){
          questionObj[1].rnd = rand;
          socket.emit('sendQuestion', questionObj);
        } else{
          questionObj[1].rnd = undefined;
          socket.emit('sendQuestion', questionObj);
        } 
        if($scope.$modal){
          $scope.$modal('hide');
        }
      });

      socket.on('updateQuestion', function(questionObj){
        //Don't judge me for what I'm about to do, it will all be over soon.
        $('#coding-challenge-header').text(questionObj.title);
        $('#problem').text(questionObj.challenge);
        //It's all over. No more DOM manipulation from the Cntrl using jQuery. Promise.

        $scope.challenge = questionObj.challenge;
        $scope.title = questionObj.title;
        answer = questionObj.answer;
        parameter = questionObj.parameter;
      });

      socket.on('loserModal', function(room){
        $modal({
          template: '../../views/loser-modal.html',
          keyboard: false,
          scope: $scope
        });
        countdown.count();
      })
      
      $scope.evaluateCode = function(){
        var originalContent = "function theAlgorithm(input){\n\
  //your code here\n\
  return input;\n\
}"
//ignore weird structure above. Needed for Ace Editor.

        var editor = ace.edit('leftEditor');
        var userAnswer = editor.getSession().getValue();
        userAnswer = userAnswer.split("");
        userAnswer.unshift('(');
        userAnswer.push('(' + "'" + parameter + "'" + ')'+ ')');
        userAnswer = userAnswer.join("");
        var result = eval(userAnswer);
        if(result === answer){
          //reset editors
          socket.emit('editorAfterSubmit', originalContent);

          var timeOut = setTimeout(function(){
            socket.emit('anotherMatch');
          }, 10000);

          //tell the person who lost
          socket.emit('youLost');

         //person who submitted it, congratuations modal
          $modal({
            template: '../../views/congratulations-modal.html',
            keyboard: false,
            scope: $scope
          }); 
          countdown.count();
        } else { 
          alert('Looks like you didn\'t have the correct answer. Try again.');
        }
      }
 }]);