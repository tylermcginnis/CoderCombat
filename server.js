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

app.get('/getQuestion', function(req, res){
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
var numOfUndefines = 0;

io.sockets.on('connection', function (socket) {
  console.log('CONNECTED');
  
  initcount += 1;
  if(numOfUndefines === 0){
    if(initcount % 2 === 1){
      roomcount += 1;
      room = roomcount.toString();
      roomList[room] = {user1: socket.id};
    } else {
      roomList[room].user2 = socket.id;
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
        console.log('numOfUndefines - 95',numOfUndefines);
        if(numOfUndefines < 0){
          numOfUndefines = 0;
        }
        console.log('numOfUndefines - 99',numOfUndefines);
        socket.broadcast.emit('modalEnd');
      } else if(roomList[property].user2 === 0){
          disconnectedRoom = property;
          roomList[disconnectedRoom].user2 = socket.id;
          socket.join(disconnectedRoom);
          numOfUndefines--;
          console.log('numOfUndefines - 104',numOfUndefines);
          if(numOfUndefines < 0){
            numOfUndefines = 0;
          }
          console.log('numOfUndefines - 108',numOfUndefines);
          socket.broadcast.emit('modalEnd');
      }
    }
      console.log('Room list -114', roomList);
      console.log('real rooms 115', io.sockets.manager.rooms);
  } 

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

  socket.on('init', function (room) {
    console.log('This One yaa 119', initcount);
    if (initcount % 2 === 0){
        console.log('Initialize New Match in room ' , room);
        socket.broadcast.emit('modalEnd');   
                        console.log('Room list -124', roomList);
            console.log('real rooms 125', io.sockets.manager.rooms);
      } else if(initcount % 2 === 1){
          console.log("Waiting for an opponent in room ", room);
          socket.emit('modalStart');
                          console.log('Room list -129', roomList);
            console.log('real rooms 130', io.sockets.manager.rooms);
      }
  });

  socket.on('youLost', function(room){
    room = socket['room'];
    socket.broadcast.to(room).emit('loserModal');
  });

  socket.on('disconnect', function (){
    console.log('Disconnected');
    initcount -=1;
    var disconUser = socket.id;
    //for loop sets the disconnected user to 0 in roomList
    for (var prop in roomList) {
        if(roomList[prop].user1 === disconUser){
          roomList[prop].user1 = 0;
          room = prop;
          numOfUndefines++;
          console.log('numOfUndefines - 141',numOfUndefines);
        } else if(roomList[prop].user2 === disconUser){
          roomList[prop].user2 = 0
          room = prop;
          numOfUndefines++;
          console.log('numOfUndefines - 146',numOfUndefines);
        }
        if(roomList[prop].user1 === 0 && roomList[prop].user2 === 0){
          numOfUndefines -= 2
          if(numOfUndefines < 0){
            numOfUndefines = 0;
          }
          console.log('numOfUndefines - 153',numOfUndefines);
          delete roomList[prop];
          roomcount--;
        }
    }
                console.log('Room list -158', roomList);
            console.log('real rooms 159', io.sockets.manager.rooms);
    socket.broadcast.to(room).emit('oppDisconnect');

    //two people with disconnected partners should be paired
    if(numOfUndefines % 2 === 0 && numOfUndefines > 0){
      var firstDisconnectedRoom;
      var firstDisconnectedUser;
      var secondDisconnectPartner;
      var secondDisconnectRoom;
      setTimeout(function(){
        var cont = true;
        for(var roomNum in roomList){
          while(cont){
            if(roomList[roomNum].user1 === 0){
              firstDisconnectedRoom = roomNum;
              firstDisconnectedUser = 'user1';
              cont = false;
            } else if(roomList[roomNum].user2 === 0){
              firstDisconnectedRoom = roomNum;
              firstDisconnectedUser = 'user2';
              cont = false;
            }
          }
          if(roomList[roomNum].user1 === 0){
            secondDisconnectRoom = roomNum;
            secondDisconnectPartner = io.sockets.clients(secondDisconnectRoom)[0];
          } else if(roomList[roomNum].user2 === 0){
            secondDisconnectRoom = roomNum;
            secondDisconnectPartner = io.sockets.clients(secondDisconnectRoom)[0];
          }
        }

        var socketNew = secondDisconnectPartner;
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
          socketNew.room = firstDisconnectedRoom;
          numOfUndefines -= 2;
          if(numOfUndefines < 0){
            numOfUndefines = 0;
          }
          console.log('numOfUndefines - 208',numOfUndefines);
          // io.sockets.in(firstDisconnectedRoom).emit('updateQuestion',questionObj);
          // io.sockets.in(firstDisconnectedRoom).emit('setInitialVals', editorText);
                      console.log('Room list -212', roomList);
            console.log('real rooms 213', io.sockets.manager.rooms);
          socket.broadcast.emit('modalEnd');
        }
      }, 2000);
    }

    //guard on if a player disconnects before getting a partner
    if(initcount === 0){
      numOfUndefines = 0;
    } 
    if(roomList[socket['room']]){
      if(Object.keys(roomList[socket['room']]).length === 1 && numOfUndefines === 1){
        numOfUndefines = 0
      }
    };

    //if player is looking for a partner when someone quits, pair new gamer with old widow
    if(initcount % 2 === 0 && numOfUndefines === 1){
      var widowRoom;
      var widower;
      var newPlayer;
      var go = true;
      setTimeout(function(){
      var newPlayerRoom;
      for(var roomNum in roomList){
        while(go){
          if(roomList[roomNum].user1 === 0){
            widowRoom = roomNum;
            widower = 'user1';
            go = false;
          } else if(roomList[roomNum].user2 === 0){
            widowRoom = roomNum;
            widower = 'user2';
            go = false;
          }
        }

        if(roomList[roomNum]){
          if(Object.keys(roomList[roomNum]).length === 1){
            newPlayerRoom = roomNum;
            newPlayer = io.sockets.clients(newPlayerRoom)[0];
            newPlayer.leave(newPlayerRoom);
            newPlayer.join(widowRoom);
            newPlayer.room = widowRoom;
            //match roomList to new room
            if(widower === 'user1'){
                roomList[widowRoom].user1 = newPlayer.id;
                delete roomList[newPlayerRoom];
                roomcount--;
              } else if(widower === 'user2'){
                roomList[widowRoom].user2 = newPlayer.id;
                delete roomList[newPlayerRoom];
                roomcount--;
              }

            numOfUndefines && (numOfUndefines--);
            console.log('numOfUndefines - 255',numOfUndefines);
            io.sockets.in(widowRoom).emit('modalEnd');
            console.log('Room list -268', roomList);
            console.log('real rooms 269', io.sockets.manager.rooms);
            break;
          }
        }
       }
      }, 3000);
    }
  });
});

server.listen(3000);