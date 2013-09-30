angular.module('CoderCombatApp.controllers', [])
  .controller('mainCntrl', [
    '$scope', 
    'socket', 
    '$modal', 
    'httpConnect',
    'countdown',
    function ($scope, socket, $modal, httpConnect, countdown) { 
      var answer;
      var parameter;

      httpConnect.connect()
          .success(function(data, status){
            console.log('HttpConnection Made')
            initialize(data);
          }).error(function(data, status){
            console.log("An error occured on httpConnect");
          });
      function initialize(questionObj){
        window.onbeforeunload = function() {
            return "Are you sure you want to leave the match?";
        }

        socket.on('join', function (room) {
            socket.emit('init', room);
        });

        socket.on('firstStart', function(){
          $scope.firstModal = 
          $modal({
            template: '../../views/pairing-modal.html',
            keyboard: false,
            scope: $scope
          });
        });

        socket.on('oppDisconnect', function(){
          $scope.quitModal = 
            $modal({
              template: '../../views/disconnect-modal.html',
              keyboard: false,
              scope: $scope,
              show: false
            });

          function showModal(){
            $scope.$modal('show');
          }

          if($scope.firstModal){
            $scope.firstModal.then(function(){
              $scope.$modal('hide');
              setTimeout(showModal, 1000);
            });
          } else if($scope.loser){
            $scope.loser.then(function(){
              $scope.$modal('hide');
              setTimeout(showModal, 1000);
            });
          } else if ($scope.quitModal){
            if($scope.winnerModal){
              $scope.winnerModal.then(function(){
                $scope.$modal('hide');
              });
            } else if($scope.loserModal){
              $scope.loserModal.then(function(){
                $scope.$modal('hide');
              });
            }
            $scope.quitModal.then(function(){
              $scope.$modal('hide');
              setTimeout(showModal, 1000);
            });
          } else if ($scope.winnerModal){
            $scope.winnerModal.then(function(){
              $scope.$modal('hide');
              setTimeout(showModal, 1000);
            });
          } else {
            showModal();
          };
        });

        socket.on('modalEnd', function(rand){
          if(rand){
            questionObj[1].rnd = rand;
            socket.emit('sendQuestion', questionObj);
          } else{
            questionObj[1].rnd = undefined;
            socket.emit('sendQuestion', questionObj);
          } 

          if($scope.firstModal){
            $scope.firstModal.then(function(){
              $scope.$modal('hide');
            });
          } else if($scope.loser){
            $scope.loser.then(function(){
              $scope.$modal('hide');
            });
          } else if ($scope.quitModal){
            $scope.quitModal.then(function(){
              $scope.$modal('hide');
            });
          } else if ($scope.winnerModal){
            $scope.winnerModal.then(function(){
              $scope.$modal('hide');
            });
          }
        });

        socket.on('updateQuestion', function(questionObj){
          //Don't judge me for what I'm about to do, it will all be over soon.
          $('#coding-challenge-header').text(questionObj.title);
          $('#problem').text(questionObj.question);
          //It's all over. No more DOM manipulation from the Cntrl using jQuery. Promise.

          $scope.challenge = questionObj.question;
          $scope.title = questionObj.title;
          answer = questionObj.answer;
          parameter = questionObj.parameter;
        });

        socket.on('loserModal', function(room){
          $scope.loser = 
          $modal({
            template: '../../views/loser-modal.html',
            keyboard: false,
            scope: $scope
          });
          countdown.count();
        })
      }
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
         $scope.winnerModal = 
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