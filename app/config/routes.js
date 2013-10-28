var path = require('path');
var mongoose = require('mongoose');

module.exports = function(app) {

  var theMongo = 'mongodb://nodejitsu_tylermcginnis33:d6r2ldui99sbtgp2dc7055n28n@ds045998.mongolab.com:45998/nodejitsu_tylermcginnis33_nodejitsudb1384566209';
  var theLocal = 'localhost'

  var db = mongoose.createConnection(theMongo); //nodejitsue
  // var db = mongoose.createConnection(theLocal, 'codercombat');

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
