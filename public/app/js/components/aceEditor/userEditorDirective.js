var app = angular.module('CC');

app.directive('userEditor', function(socket, initiateEditor, $modal, $modalStack){
  return {
    restrict: 'E',
    template: "<p id='uEditor'></p>",
    link: function(scope, ele, attr) {  
      var editor = ace.edit("uEditor");
      editor.setTheme("ace/theme/eclipse");
      editor.setFontSize(19);

      var session = editor.getSession();
      session.setUseWrapMode(true);
      session.setMode("ace/mode/javascript");

      editor.on('change', function(){
        var currentText = session.getValue();
        socket.emit('userChangedEditor', currentText);
      });
      scope.userSession = session;

      editor.on('focus', function(){
        scope.$apply(scope.highlightSubmit = true);
      })

      scope.editor = editor;

      scope.returnEditorText = function(){
        return session.getValue();
      }

      socket.on('openWinnerModal', function(){
        $modalStack.dismissAll();
        scope.winnerModal = $modal.open({
          templateUrl: 'js/components/modals/winnerModal.html',
          controller: 'mainCtrl'
        });
      });

      socket.on('openLoserModal', function(){
        $modalStack.dismissAll();
        scope.loserModal = $modal.open({
          templateUrl: 'js/components/modals/loserModal.html',
          controller: 'mainCtrl'
        });
      });

      socket.on('destroyLoserModal', function(){
        scope.loserModal && scope.loserModal.close();
        $modalStack.dismissAll();
      })

      socket.on('waitingForOpponent', function(){
        scope.waitingForOpponentModal = $modal.open({
          templateUrl: 'js/components/modals/waitingForOpponent.html',
          controller: 'mainCtrl'
        });
      });

      socket.on('initializeQuestion', function(randomNum){
        scope.highlightSubmit = false;
        initiateEditor.setUpEditor(randomNum, scope);
      });

      socket.on('cleanEditor', function(){
        initiateEditor.clearEditor(scope);
      });


    }
  }
});