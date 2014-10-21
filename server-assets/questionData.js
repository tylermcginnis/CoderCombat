var questionData = [
  {
    question: 'Have the function "reverse" take a string as the parameter and return that string after it\'s been reversed',
    fn: 'function reverse(str){\n\n}',
    parameter: 'this is the answer',
    answer: 'rewsna eht si siht'
  },
  {
    question: 'Have the function "longest" take a string as the parameter and returns the longest word in that string.',
    fn: 'function longest(str){\n\n}',
    parameter: 'spaceship is the longest word',
    answer: 'spaceship'
  },
  {
    question: 'Have the function "dyslexicYoda" take a string as the parameter and return that string after you reverse the order of the words. ie "I enjoy eating cold meatballs" becomes "meatballs cold eating enjoy I"',
    fn: 'function dyslexicYoda(str){\n\n}',
    parameter: 'Leo enjoys his toys',
    answer: 'toys his enjoys Leo'
  },
  {
    question: 'Have the function "vowelCount" take a string and return how many vowels are in that string',
    fn: 'function vowelCount(str){\n\n}',
    parameter: 'How many vowels are in this sentence?',
    answer: 11
  },
  {
    question: 'Have the function "palindrome" take a string and return true if that string is a palindrome (written the same forward and backwards)',
    fn: 'function palindrome(str){\n\n}',
    parameter: 'kayak',
    answer: true
  },
  {
    question: 'Have the function "titleMaker" take a string and return that string after capitalizing the first letter in every word.',
    fn: 'function titleMaker(str){\n\n}',
    parameter: 'peter piper picked peppers and run rocked rhymes',
    answer: 'Peter Piper Picked Peppers And Run Rocked Rhymes'
  }
];

module.exports.getQuestionData = function(){
  return questionData;
}