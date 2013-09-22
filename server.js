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
    console.log('socket being called on editorChange', socket);
    console.log('room of that socket', socket.id);
    var room = socket['room'];
    socket.broadcast.to(room).emit('sendChange', fullText);
  });
  //somehow when I'm altering the sockets earlier (adding one to another room), on editorChange the socket being called must not be the right one or the room
  //isn't the right room. 
  socket.on('sendQuestion', function(questionObj){
    var room = socket['room'];
    io.sockets.in(room).emit('updateQuestion',questionObj);
  });

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
        numOfUndefines--;
        socket.broadcast.emit('modalEnd');
      } else if(roomList[property].user2 === 0){
        disconnectedRoom = property;
        roomList[disconnectedRoom].user2 = socket.id;
        socket.join(disconnectedRoom);
        numOfUndefines--;
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

  socket.on('disconnect', function () {
    console.log('Disconnected');
    initcount -=1;
    var disconUser = socket.id;
    //for loop sets the disconnected user to 0 in roomList
    for (var prop in roomList) {
        if(roomList[prop].user1 === disconUser){
          roomList[prop].user1 = 0;
          room = prop;
          numOfUndefines++;
        } else if(roomList[prop].user2 === disconUser){
          roomList[prop].user2 = 0
          room = prop;
          numOfUndefines++;
        }
        if(roomList[prop].user1 === 0 && roomList[prop].user2 === 0){
          numOfUndefines -= 2;
          delete roomList[prop];
          roomcount--;
        }
    }

    socket.broadcast.to(room).emit('oppDisconnect');

     //debug starts below
    if(numOfUndefines % 2 === 0 && numOfUndefines > 0){
      var firstDisconnectedRoom;
      var firstDisconnectedUser;
      var secondDisconnectPartner;
      var secondDisconnectRoom;
      setTimeout(function(){
        var cont = true;
        console.log("At this moment RoomList needs to be exactly the same as the real rooms");
        console.log("Original ROOMLIST - ", roomList);
        console.log('Real Rooms - ' , io.sockets.manager.rooms);
        for(var roomNum in roomList){
          console.log("RoomNum is the prob. Here it is, ", roomNum);
          while(cont){
            if(roomList[roomNum].user1 === 0){
              firstDisconnectedRoom = roomNum;
              firstDisconnectedUser = 'user1';
              cont = false;
              console.log('this should be 1 - first disconnect room', firstDisconnectedRoom);
            } else if(roomList[roomNum].user2 === 0){
              firstDisconnectedRoom = roomNum;
              firstDisconnectedUser = 'user2';
              cont = false;
              console.log('this should not log');
            }
          }
          if(roomList[roomNum].user1 === 0){
            secondDisconnectRoom = roomNum;
            secondDisconnectPartner = io.sockets.clients(secondDisconnectRoom)[0];
            console.log('this is being saved into secondDisconnectPartner and eventually to socketNew', secondDisconnectPartner);
            console.log('this should be 2 - secondDisconnectRoom', secondDisconnectRoom);
          } else if(roomList[roomNum].user2 === 0){
            secondDisconnectRoom = roomNum;
            secondDisconnectPartner = io.sockets.clients(secondDisconnectRoom)[0];
            console.log('this should not log. below');
          }
        }

        var socketNew = secondDisconnectPartner;
        var socketNews = io.sockets.clients('2');
        console.log('new socket', socketNews[0].room);
        if(socketNew){
          if(firstDisconnectedUser === 'user1'){
            roomList[firstDisconnectedRoom].user1 = secondDisconnectPartner.id;
            delete roomList[secondDisconnectRoom];
            roomcount--;
          } else if(firstDisconnectedUser === 'user2'){
            roomList[firstDisconnectedRoom].user2 = secondDisconnectPartner.id;
            delete roomList[secondDisconnectRoom];
            roomcount--;
          }

          socketNew.leave(secondDisconnectRoom);
          socketNew.join(firstDisconnectedRoom);
          socketNew.room = '1';
          console.log('after change',socketNew.room);
          numOfUndefines && (numOfUndefines -= 2);
          socket.broadcast.emit('modalEnd');
          console.log("After all is done, we want the real room list to mimic this- ", roomList);
          console.log('Real Rooms after - ' , io.sockets.manager.rooms)
        }
      }, 2000);
    }
  });
});

server.listen(3000);