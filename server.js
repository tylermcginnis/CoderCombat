/**
 * Module dependencies.
 */
 
var express = require('express');
var http = require('http');
var path = require('path');
 
var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);


app.get('/', function(req, res){
  res.sendfile(__dirname + '/app/index.html')
});
 
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
var game;

io.sockets.on('connection', function (socket) {
  socket.on('editorChange', function(fullText){
    var room = socket['room'];
      socket.broadcast.to(room).emit('sendChange', fullText);
  });

  initcount += 1;
  if (initcount % 2 === 1) {
    roomcount += 1;
    room = roomcount.toString();
    roomList[room] = {user1: socket.id};
  } else {
    roomList[room].user2 = socket.id
  }
  socket.join(room);
  socket['room'] = room;
  socket.in(room).emit('join', room);

  socket.on('init', function (room) {
    if (initcount % 2 === 0){
      console.log('Initialize New Match');
      socket.emit('modalEnd');
      
      // game = new serverGame();
      // roomList[room].game = game;
      // roomList[room].game.initGame();
      // userSocket.in(room).broadcast.emit('serverChickens', roomList[room].game.serverChickens, roomList[room].game.serverSpiders);
      // userSocket.in(room).emit('serverChickens', roomList[room].game.serverChickens, roomList[room].game.serverSpiders);
      } else{
        console.log("Waiting for an opponent");
        socket.emit('modalStart');
      }
   });
});

server.listen(3000);
