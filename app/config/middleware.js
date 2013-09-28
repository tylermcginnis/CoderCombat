var express = require('express');
var path = require('path');

module.exports = function(app){

  var allowCrossDomain = function(req, res, next) { //not sure what this does
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  } 

  app.use(allowCrossDomain);
  app.use(express.static(path.join(__dirname + '/..' + '/public')));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
}