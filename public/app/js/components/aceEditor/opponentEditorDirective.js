var app = angular.module('CC');

app.directive('opponentEditor', function(socket, initiateEditor) {
  return {
    restrict: 'E',
    template: "<p id='oEditor' class='oEditor'></p>",
    link: function(scope, ele, attr) {
      var editor = ace.edit("oEditor");
      editor.setTheme("ace/theme/eclipse");
      editor.setReadOnly(true);
      editor.renderer.setShowGutter(false);
      editor.setFontSize(15);

      var session = editor.getSession();
      session.setUseWrapMode(true);
      session.setMode("ace/mode/javascript");
      scope.oppSession = session;

      editor.on('focus', function(){
        //refactor later
        alert('No one likes a cheater');
      });

      editor.on('copy', function(){
        //refactor later
        alert('No one likes a cheater');
      });

      socket.on('updateText', function (newTxt) {
        session.setValue(newTxt);
      });

      scope.oEditor = editor;

      socket.on('initializeQuestion', function(randomNum){
        initiateEditor.setUpEditor(randomNum, scope);
      });

      socket.on('cleanEditor', function(){
        initiateEditor.clearEditor(scope);
      });
    }
  }
});