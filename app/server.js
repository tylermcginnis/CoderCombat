var express = require('express');
var http = require('http');
var app = express();

require('./config/middleware.js')(app);
require('./config/routes.js')(app);

var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });

  var room;
  var initCount = 0;
  var roomCount = 0;
  var roomList = {};
  var numOfUndefines = 0;

  io.sockets.on('connection', function (socket) {
    console.log(socket.id +  ' CONNECTED');

    var createRandomNumber = function(){
      return Math.floor(Math.random() * 9-1) + 2;
    }

    initCount += 1;
    if(numOfUndefines === 0){
      if(initCount % 2 === 1){
        roomCount += 1;
        room = roomCount.toString();
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
          socket['room'] = disconnectedRoom;
          numOfUndefines && numOfUndefines--;
          var random = createRandomNumber();
          socket.broadcast.emit('modalEnd', random);
        } else if(roomList[property].user2 === 0){
            disconnectedRoom = property;
            roomList[disconnectedRoom].user2 = socket.id;
            socket.join(disconnectedRoom);
            socket['room'] = disconnectedRoom;
            numOfUndefines && numOfUndefines--;
            var random = createRandomNumber();
            socket.broadcast.emit('modalEnd', random);
        }
      }
    } 

    socket.on('initialEditor', function(editorText){
      var room = socket['room'];
      socket.broadcast.to(room).emit('setInitialVals', editorText);
    });

    socket.on('editorAfterSubmit', function(text){
      var room = socket['room'];
      io.sockets.in(room).emit('setInitialVals', text);
    });

    socket.on('editorChange', function(fullText){
      var room = socket['room'];
      socket.broadcast.to(room).emit('sendChange', fullText);
    });

    socket.on('sendQuestion', function(questionObj){
      var theQuestion = {};
      var room = socket['room'];
      if(questionObj[1].rnd !== undefined && (roomList[room].rnd = questionObj[1].rnd)){
          roomList[room].rnd = questionObj[1].rnd;
      }

      if(roomList[room] && (roomList[room].rnd === undefined)){
          roomList[room].rnd = Math.floor(Math.random() * 8-1) + 2;
      }
      if(roomList[room] && (roomList[room].rnd) && (questionObj[roomList[room].rnd])){
            theQuestion = questionObj[roomList[room].rnd];
            //only send the final quesiton to updateQuestion
            io.sockets.in(room).emit('updateQuestion', theQuestion);
      }
    });

    socket.on('init', function (room) {
      if(initCount % 2 === 0){
          io.sockets.in(room).emit('modalEnd');
        } else if(initCount % 2 === 1){
            io.sockets.in(room).emit('firstStart');
        }
    });

    socket.on('youLost', function(room){
      room = socket['room'];
      socket.broadcast.to(room).emit('loserModal');
    });

    socket.on('anotherMatch', function(){
      var room = socket['room'];
      var random = createRandomNumber();
      io.sockets.in(room).emit('modalEnd', random);
    });

    socket.on('disconnect', function (){
      console.log('Disconnected');
      initCount -=1;
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
            numOfUndefines -= 2
            numOfUndefines && (numOfUndefines = 0);
            delete roomList[prop];
            roomCount--;
          }
      }
      socket.broadcast.to(room).emit('oppDisconnect');

      !initCount && (numOfUndefines = 0);

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
              roomCount--;
            } else if(firstDisconnectedUser === 'user2'){
              roomList[firstDisconnectedRoom].user2 = secondDisconnectPartner.id;
              delete roomList[secondDisconnectRoom];
              roomCount--;
            }

            socketNew.leave(secondDisconnectRoom);
            socketNew.join(firstDisconnectedRoom);
            socketNew.room = firstDisconnectedRoom;
            numOfUndefines -= 2;
            !numOfUndefines && (numOfUndefines = 0);

            var random = createRandomNumber();
            setTimeout(function(){
              io.sockets.in(firstDisconnectedRoom).emit('modalEnd', random);
            }, 2000);
          }
        }, 500);
      };

      //guard on if a player disconnects before getting a partner
      !initCount && (numOfUndefines = 0);

      if(roomList[socket['room']]){
        if(Object.keys(roomList[socket['room']]).length === 1 && numOfUndefines === 1){
          numOfUndefines = 0
        }
      };

      //if player is looking for a partner when someone quits, pair new gamer with old widow
      if(initCount % 2 === 0 && numOfUndefines === 1){
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

            if(roomList[roomNum] && Object.keys(roomList[roomNum]).length === 1){
              newPlayerRoom = roomNum;
              newPlayer = io.sockets.clients(newPlayerRoom)[0];
              newPlayer.leave(newPlayerRoom);
              newPlayer.join(widowRoom);
              newPlayer.room = widowRoom;
              
              //match roomList to new room
              if(widower === 'user1'){
                  roomList[widowRoom].user1 = newPlayer.id;
                  delete roomList[newPlayerRoom];
                  roomCount--;
                } else if(widower === 'user2'){
                  roomList[widowRoom].user2 = newPlayer.id;
                  delete roomList[newPlayerRoom];
                  roomCount--;
                }

              numOfUndefines && (numOfUndefines--);
              var random = createRandomNumber();
              io.sockets.in(widowRoom).emit('modalEnd', random);
              break;
            }
          }
        }, 500);
      }
      socket.leave(room); 
    });
  });

// server.listen(3000);
server.listen(80); //nodejitsu