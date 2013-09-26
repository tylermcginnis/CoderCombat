/**
 * Module dependencies.
 */
 
var express = require('express');
var http = require('http');
var path = require('path');
 
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });
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
  console.log(socket.id +  ' CONNECTED');
  console.log('Room list -62', roomList);
  console.log('real rooms 63', io.sockets.manager.rooms);
  
  initcount += 1;
  console.log('new initcount - 64: ', initcount);
  if(numOfUndefines === 0){
    if(initcount % 2 === 1){
      roomcount += 1;
      room = roomcount.toString();
      roomList[room] = {user1: socket.id};
    } else {
      roomList[room].user2 = socket.id;
    }
    socket.join(room);
    console.log(socket.id + 'just joined 74 room: ' + room);
    socket['room'] = room;
    socket.in(room).emit('join', room);
  } else if(numOfUndefines > 0 && numOfUndefines % 2 === 1){
    console.log('this is shown because numOfUndefines > 0 and odd')
    var disconnectedRoom;
    for(var property in roomList){
      if(roomList[property].user1 === 0){
        disconnectedRoom = property;
        roomList[disconnectedRoom].user1 = socket.id;
        socket.join(disconnectedRoom);
        numOfUndefines--;
        console.log('numOfUnd is now - 86: ',numOfUndefines);
        if(numOfUndefines < 0){
          numOfUndefines = 0;
        }
        console.log('numOfUndefines is now - 90',numOfUndefines);
        socket.broadcast.emit('modalEnd');
      } else if(roomList[property].user2 === 0){
          disconnectedRoom = property;
          roomList[disconnectedRoom].user2 = socket.id;
          socket.join(disconnectedRoom);
          console.log(socket.id + ' just joined room - 96: ' + disconnectedRoom);
          numOfUndefines--;
          console.log('numOfUndefines is now - 98',numOfUndefines);
          if(numOfUndefines < 0){
            numOfUndefines = 0;
          }
          console.log('numOfUndefines is now - 102',numOfUndefines);
          socket.broadcast.emit('modalEnd');
      }
    }
      console.log('Room list -102', roomList);
      console.log('real rooms 103', io.sockets.manager.rooms);
  } 

  socket.on('initialEditor', function(editorText){
    var room = socket['room'];
    socket.broadcast.to(room).emit('setInitialVals', editorText);
    console.log('initialEditor was called on room -113: ', room);
  });

  socket.on('editorAfterSubmit', function(text){
    var room = socket['room'];
    console.log('editorAfterSubmit about to be called in room', room);
    io.sockets.in(room).emit('setInitialVals', text);
  });

  socket.on('editorChange', function(fullText){
    var room = socket['room'];
    socket.broadcast.to(room).emit('sendChange', fullText);
  });

  socket.on('sendQuestion', function(questionObj){
    var room = socket['room'];
    console.log('the rooms about to be sent the questions', roomList);
    console.log('the real rooms about to be sent the question', io.sockets.manager.rooms);
    io.sockets.in(room).emit('updateQuestion', questionObj);
    console.log('here is the question OBJ on 127', questionObj);
    console.log('sendQuestion was called and sent to room - 123: ', room);
  });

  socket.on('init', function (room) {
    if (initcount % 2 === 0){
        console.log('Initialize New Match in room ' , room);
        io.sockets.in(room).emit('modalEnd');
        console.log('modalEnd was just emitted to room - 130: ', room);
        console.log('Room list -131', roomList);
        console.log('real rooms 132', io.sockets.manager.rooms);
        console.log('init count - 133', initcount);
      } else if(initcount % 2 === 1){
          console.log("Waiting for an opponent in room ", room);
          io.sockets.in(room).emit('modalStart');
          console.log('modalStart was just emitted to room - 137: ', room);
          console.log('Room list -138', roomList);
          console.log('real rooms 139', io.sockets.manager.rooms);
          console.log('initcount - 140', initcount);
      }
  });

  socket.on('youLost', function(room){
    room = socket['room'];
    socket.broadcast.to(room).emit('loserModal');
    console.log('loserModal was just emmited to -147 room: ', room);
  });

  socket.on('anotherMatch', function(){
    var room = socket['room'];
    io.sockets.in(room).emit('modalEnd');
  });

  socket.on('disconnect', function (){
    console.log(socket.id + ' Disconnected');
    initcount -=1;
    console.log('initcount just became', 153);
    var disconUser = socket.id;
    //for loop sets the disconnected user to 0 in roomList
    for (var prop in roomList) {
        if(roomList[prop].user1 === disconUser){
          roomList[prop].user1 = 0;
          room = prop;
          numOfUndefines++;
          console.log('numOfUndefines just became - 161',numOfUndefines);
        } else if(roomList[prop].user2 === disconUser){
          roomList[prop].user2 = 0
          room = prop;
          numOfUndefines++;
          console.log('numOfUndefines just became - 166',numOfUndefines);
        }
        if(roomList[prop].user1 === 0 && roomList[prop].user2 === 0){
          numOfUndefines -= 2
          console.log('numofUnd just got subtracted by two to be 170-: ', numOfUndefines);
          if(numOfUndefines < 0){
            numOfUndefines = 0;
          }
          console.log('numOfUndefines just became- 173',numOfUndefines);
          delete roomList[prop];
          roomcount--;
          console.log('roomcount just became', roomcount);
        }
    }
    console.log('Room list -180', roomList);
    console.log('real rooms 181', io.sockets.manager.rooms);
    socket.broadcast.to(room).emit('oppDisconnect');
    console.log('oppDisconnect was just emmitted to 183 room: ', room);

    if(initcount === 0){
      numOfUndefines = 0;
      console.log('numOfUndefines became 0 because initcount was 0 - 187');
    } 

    //two people with disconnected partners should be paired
    if(numOfUndefines % 2 === 0 && numOfUndefines > 0){
      console.log('this was logged because numOfUndefines was even and > 0');
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

          console.log('after loop, firstDisconnectedUser: 221:', firstDisconnectedUser);
          console.log('firstDisconnectedRoom 222:', firstDisconnectedRoom);
          console.log('secondDisconnectPartner 223', secondDisconnectPartner);
          console.log('secondDisconnectRoom 224', secondDisconnectRoom);

        var socketNew = secondDisconnectPartner;
        if(socketNew){
          if(firstDisconnectedUser === 'user1'){
            roomList[firstDisconnectedRoom].user1 = secondDisconnectPartner.id;
            delete roomList[secondDisconnectRoom];
            roomcount--;
            console.log('roomcount just became 232', roomcount);
          } else if(firstDisconnectedUser === 'user2'){
            roomList[firstDisconnectedRoom].user2 = secondDisconnectPartner.id;
            delete roomList[secondDisconnectRoom];
            roomcount--;
            console.log('roomcount just became 237', roomcount);
          }

          socketNew.leave(secondDisconnectRoom);
          console.log(socketNew.id + 'just left ' + secondDisconnectRoom);
          socketNew.join(firstDisconnectedRoom);
          console.log(socketNew.id + 'just joined 243' + firstDisconnectedRoom);
          socketNew.room = firstDisconnectedRoom;
          io.sockets.in(firstDisconnectedRoom).emit('modalEnd'); //CHANGED THIS LINE
          numOfUndefines -= 2;
          console.log('numOfUndefines just got subtracted by 2 to be250', numOfUndefines);
          if(numOfUndefines < 0){
            numOfUndefines = 0;
            console.log('numOfUndefines just became 0 since it was negative, 249', numOfUndefines)
          }
          // io.sockets.in(firstDisconnectedRoom).emit('updateQuestion',questionObj);
          // io.sockets.in(firstDisconnectedRoom).emit('setInitialVals', editorText);
          console.log('Room list -233', roomList);
          console.log('real rooms 234', io.sockets.manager.rooms);
          // socket.broadcast.emit('modalEnd');
          io.sockets.in(firstDisconnectedRoom).emit('modalEnd'); //CHANGED THIS LINE
          console.log('modalEnd was just emitted to 256', firstDisconnectedRoom);
        }
      }, 500);
    }

    //guard on if a player disconnects before getting a partner
    if(initcount === 0){
      numOfUndefines = 0;
      console.log('265 numOfUndefines just became 0 since initcount was 0. this should never be logged');
    } 
    if(roomList[socket['room']]){
      if(Object.keys(roomList[socket['room']]).length === 1 && numOfUndefines === 1){
        numOfUndefines = 0
        console.log(' 270 numOfUndefines just became 0 since it was the only room and the only numOfUndefines');
      }
    };

    //if player is looking for a partner when someone quits, pair new gamer with old widow
    if(initcount % 2 === 0 && numOfUndefines === 1){
      console.log('276 this was logged because initcount is even and numOfUndefines was 1');
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
        console.log('widowRoom 295', widowRoom);
        console.log('widower 296', widower);

        if(roomList[roomNum]){
          if(Object.keys(roomList[roomNum]).length === 1){
            newPlayerRoom = roomNum;
            console.log('305 newPlayerRoom', newPlayerRoom);
            newPlayer = io.sockets.clients(newPlayerRoom)[0];
            console.log('306 newPlayer id', newPlayer.id);
            newPlayer.leave(newPlayerRoom);
            console.log(newPlayer.id + 'just left ' + newPlayerRoom);
            newPlayer.join(widowRoom);
            console.log(newPlayer.id + 'just joined 307' + widowRoom);
            newPlayer.room = widowRoom;
            
            //match roomList to new room
            if(widower === 'user1'){
                roomList[widowRoom].user1 = newPlayer.id;
                delete roomList[newPlayerRoom];
                roomcount--;
                console.log('roomcount became 315', roomcount);
              } else if(widower === 'user2'){
                roomList[widowRoom].user2 = newPlayer.id;
                delete roomList[newPlayerRoom];
                roomcount--;
                console.log('roomcount became 320', roomcount);
              }

            numOfUndefines && (numOfUndefines--);
            console.log('numOfUndefines just became- 324',numOfUndefines);
            io.sockets.in(widowRoom).emit('modalEnd');
            console.log('modalEnd was just emitted to 326', widowRoom);
            console.log('Room list -327', roomList);
            console.log('real rooms 328', io.sockets.manager.rooms);
            break;
          }
        }
       }
      }, 500);
    }
    socket.leave(room); //added. try removing later. 
  });
});

server.listen(3000);