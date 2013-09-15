angular.module('CoderCombatApp.directives', [])
  .directive('editor1', ['socket', function(socket) {
    return {
      restrict: 'AE',
      templateUrl: "../../views/editor1.html",
      link: function(scope, ele, attr) {  
          var editor = ace.edit("leftEditor");
          editor.setTheme("ace/theme/eclipse");
          editor.getSession().setUseWrapMode(true);
          editor.getSession().setMode("ace/mode/javascript");
          editor.on('change', function(changeObj){
            var currentText = editor.getSession().getValue();
            socket.emit('editorChange', currentText);
          });
          scope.editor = editor;
      }
    }
  }])
  .directive('editor2', ['socket', function(socket) {
    return {
      restrict: 'AE',
      templateUrl: "../../views/editor2.html",
      link: function(scope, ele, attrs) {   
          var oEditor = ace.edit("rightEditor");
          oEditor.setTheme("ace/theme/eclipse");
          oEditor.getSession().setUseWrapMode(true);
          oEditor.getSession().setMode("ace/mode/javascript");
          oEditor.setReadOnly(true);
          socket.on('sendChange', function (text) {
            oEditor.getSession().setValue(text);
          });
          scope.oEditor = oEditor;
      }
    }
  }])
  .directive('foot',  function() {
    return {
      restrict: 'AE',
      templateUrl: "../../views/foot.html",
      link: function(scope, ele, attrs) {}
    }
  });
