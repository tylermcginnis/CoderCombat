var app = angular.module('CC');

app.service('initiateEditor', function($http, $q, socket){
  var questions = {};
  var singleQuestion = {};

  this.setQuestionData = function(data){
    questions.data = data;
  };

  this.getRandomQuestion = function(randomInt){
    return questions.data[randomInt];
  };

  this.getQuestions = function(){
    var d = $q.defer();
    $http({
      method: 'GET',
      url: '/api/questions'
    }).success(function(data){
      d.resolve(data);
    }).error(function(){
      d.error('There was an error retrieving the questions');
    });
    return d.promise;
  };

  this.setUpEditor = function(randomNum, scope){
    scope.questionData = this.getRandomQuestion(randomNum);
    singleQuestion = scope.questionData;
    scope.userSession.setValue(scope.questionData.fn);
    scope.oppSession.setValue(scope.questionData.fn);
  };

  this.clearEditor = function(scope){
    scope.questionData = {};
    singleQuestion = {};
    scope.oppSession.setValue('');
    scope.userSession.setValue('');
  };

  this.validateCode = function(submittedCode){
    var userFn = submittedCode;
    modifiedUserFn = '(' + userFn + '( "' + singleQuestion.parameter + '"))';
    var result = eval(modifiedUserFn);
    if(result === singleQuestion.answer){
      return true;
    } else {
      return false
    }
  }
});