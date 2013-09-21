var test = 'the original input';
var answer = test.split("").reverse().join("");
var editor = ace.edit('leftEditor');
var userAnswer = editor.getSession().getValue();
userAnswer = userAnswer.split("");
userAnswer.unshift('(');
userAnswer.push('(' + "'" + test + "'" + ')'+ ')');
userAnswer = userAnswer.join("");
var result = eval(userAnswer);
if(answer === result){console.log("Correct!")}


/*
  1) On Submit...
  2) Get and save original parameter from DB. 
  3) Get and save answer from DB
  4) create an instance of ace editor
  5) Get the value of the editor
  6) Alter the value of the editor to be in the right form
  7) Evaluate the altered editor code and save it to a variable
  8) Verify the answer is correct
  9) If correct, emit that whoever submitted it won. 
  10) It not correct, emit to only the submitter that it wasn't correct
*/