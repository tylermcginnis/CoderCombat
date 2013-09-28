var path = require('path');
var mongoose = require('mongoose');
// var db = require('./db.js');

module.exports = function(app) {

  var db = mongoose.createConnection("localhost", "codercombat");

  db.on('error', console.error.bind(console, 'connection error:'));
  db.on('disconnected', function(){
    console.log("Disconnected from DB");
  });

  db.once('open', function(){
    console.log('Connection is Open');
  });

  var questionschema = require("../public/schemas/questionSchema.js");

  app.get('/', function(req, res){
    var thePath = path.join(__dirname + '/..' + '/public/index.html')
    res.sendfile(thePath);
  });

  app.get('/getQuestion', function(req, res){
    var collectionName = 'questions';
    var processor = db.model('questions', questionschema.questionSchema, collectionName, false);
    processor.find().execFind(function(err, dataFromDb){
      res.send(dataFromDb);
    });
  });
};
