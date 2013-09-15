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
  socket.in(room).emit('join', room) //being triggered twice and freezing.

  socket.on('init', function (room) {
    if (initcount % 2 === 0){
        console.log('Initialize New Match in room ' , room);
        // socket.emit('modalEnd');   
    
      } else{
          console.log("Waiting for an opponent in room ", room);
          // socket.emit('modalStart');
      }
  });

  socket.on('disconnect', function () {
    console.log('Disconnected');
    //Do Something here
  });
});

server.listen(3000);
