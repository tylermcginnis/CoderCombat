angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', [
    '$scope', 
    'socket', 
    '$modal', 
    'httpConnect', 
    function ($scope, socket, $modal, httpConnect) { 
      var questionObj = {};
      var answer;
      var parameter;
      httpConnect.connect()
          .success(function(data, status){
            alert('successful connection');
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
          questionObj[0].rnd = rand;
          console.log('new', questionObj);
          socket.emit('sendQuestion', questionObj);
        } else{
          socket.emit('sendQuestion', questionObj);
        } 
        if($scope.$modal){
          $scope.$modal('hide');
        }
      });
      socket.on('updateQuestion', function(questionObj){
        // var e = document.getElementById('main-container');
        // var s = angular.element(e).scope();
        // console.log("S", s);
        // s.safeApply(function(){
        //   s.challenge = questionObj.challenge;
        //   s.title = questionObj.title;
        //   answer = questionObj.answer;
        //   parameter = questionObj.parameter;
        // });

        console.log('this is the question recieved on updateQuestion', questionObj);
        $scope.safeApply(function(){
          $scope.challenge = questionObj.challenge;
          $scope.title = questionObj.title;
          answer = questionObj.answer;
          parameter = questionObj.parameter;
        });

        console.log('$scope.title', $scope.title);
      });
      socket.on('loserModal', function(room){
        $modal({
          template: '../../views/loser-modal.html',
          keyboard: false,
          scope: $scope
        });
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

        } else { 
          alert('Looks like you didn\'t have the correct answer. Try again.');
        }
      }
 }]);