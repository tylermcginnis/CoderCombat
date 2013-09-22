/**
 * Module dependencies.
 */
 
var express = require('express');
var http = require('http');
var path = require('path');
 
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');

var db = mongoose.createConnection("localhost", "codercombat");

db.on('error', console.error.bind(console, 'connection error:'));
db.on('disconnected', function(){
  console.log("Disconnected from DB");
});

db.once('open', function(){
  console.log('Connection is Open');
});

var questionschema = require("./app/schemas/questionSchema.js");

app.get('/', function(req, res){
  res.sendfile(__dirname + '/app/index.html');
});

app.get('/getQuestion', function(req, res){ //refactor to send back random question
  var collectionName = 'questions';
  var processor = db.model('questions', questionschema.questionSchema, collectionName, false);
  processor.find().execFind(function(err, dataFromDb){
    res.send(dataFromDb);
  });
});
 
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
} 

app.use(allowCrossDomain);
app.use(express.static(__dirname + '/app/'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

var room;
var initcount = 0;
var roomcount = 0;
var roomList = {};
var numOfUndefines = 0; //Number of rooms with a disconnected user

io.sockets.on('connection', function (socket) {
  socket.on('initialEditor', function(editorText){
    var room = socket['room'];
    socket.broadcast.to(room).emit('setInitialVals', editorText);
  });
  socket.on('editorChange', function(fullText){
    var room = socket['room'];
    socket.broadcast.to(room).emit('sendChange', fullText);
  });
  socket.on('sendQuestion', function(questionObj){
    var room = socket['room'];
    io.sockets.in(room).emit('updateQuestion',questionObj);
  });

  console.log('NUM of Undefines', numOfUndefines);
  initcount += 1;
  if(numOfUndefines === 0){
    if(initcount % 2 === 1){
      roomcount += 1;
      room = roomcount.toString();
      roomList[room] = {user1: socket.id};
    } else {
      roomList[room].user2 = socket.id
    }
    socket.join(room);
    socket['room'] = room;
    socket.in(room).emit('join', room);
  } else if(numOfUndefines > 0 && numOfUndefines % 2 === 1){
    var disconnectedRoom;
    for(var property in roomList){
      if(roomList[property].user1 === 0){
        disconnectedRoom = property;
        roomList[disconnectedRoom].user1 = socket.id;
        socket.join(disconnectedRoom);
        socket.broadcast.emit('modalEnd');
      } else if(roomList[property].user2 === 0){
        disconnectedRoom = property;
        roomList[disconnectedRoom].user2 = socket.id;
        socket.join(disconnectedRoom);
        socket.broadcast.emit('modalEnd');
      }
    }
  } 

  socket.on('init', function (room) {
    if (initcount % 2 === 0){
        console.log('Initialize New Match in room ' , room);
        socket.broadcast.emit('modalEnd');   
    
      } else{
          console.log("Waiting for an opponent in room ", room);
          socket.emit('modalStart');
      }
  });

  //SOLUTION: If the newly disconnected user is the only undefined user, decrement.
  socket.on('disconnect', function () {
    console.log('Disconnected');
    var disconUser = socket.id;
    //for loop sets the disconnected user to undefined in roomList
    for (var prop in roomList) {//might not be neccessary
        if(roomList[prop].user1 === disconUser){
          roomList[prop].user1 = 0;
          room = prop;
        } else if(roomList[prop].user2 === disconUser){
          roomList[prop].user2 = 0
          room = prop;
        }

        if(roomList[prop].user1 === 0 && roomList[prop].user2 === 0){
          numOfUndefines -= 2;
          delete roomList[prop];
        }
    }

    numOfUndefines++;
   
    console.log("ROOM LIST", roomList);
    initcount -=1;
    socket.broadcast.to(room).emit('oppDisconnect');

        console.log('Num of Undefines', numOfUndefines);
      if(numOfUndefines % 2 === 0 && numOfUndefines > 0){
          var firstDisconnectedRoom;
          var firstDisconnectedUser;
          var secondDisconnectPartner;
          var secondDisconnectRoom;
        setTimeout(function(){
          var cont = true;
          for(var property in roomList){
            while(cont){
              if(roomList[property].user1 === 0){
                firstDisconnectedRoom = property;
                firstdisconnectedUser = 'user1';
                cont = false;
                continue;
              } else if(roomList[property].user2 === 0){
                firstDisconnectedRoom = property;
                firstDisconnectedUser = 'user2';
                cont = false;
                continue;
              }
            }

            if(roomList[property].user1 === 0){
              secondDisconnectRoom = property;
              secondDisconnectPartner = io.sockets.clients(secondDisconnectRoom)[0];
              console.log('partner', secondDisconnectPartner);
            } else if(roomList[property].user2 === 0){
              secondDisconnectRoom = property;
              secondDisconnectPartner = io.sockets.clients(secondDisconnectRoom)[0];
              console.log('partner', secondDisconnectPartner);
            }
          }
        var socketNew = secondDisconnectPartner;
        socketNew.join(firstDisconnectedRoom);
        socket.broadcast.emit('modalEnd');
        }, 2000);
      }

  });
});

server.listen(3000);

//see if I can just get the roomName and socketIO room of the person who
//disconnected then put the new person in that same room. 
