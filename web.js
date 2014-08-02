var http = require('http');
var express = require('express');
var sync = require('./index.js');

var app = express();
app.get('/ds', function(req, res) {
  res.send('Hello World!');
});


var port = process.env.PORT || 5577;
var server = app.listen(port, function() {
  console.log('Server start...');
  //sync(); // sync the first time when server start up
  setInterval(call, process.env.SYNC_INTERVAL);
});

var call = function() {
  var option = {
    host: 'localhost', 
    port: port, 
    path: '/dict', 
    method: 'GET'
  };
  var req = http.request(option, function(res) {
    console.log('server-side request complete');
  });
  req.end();
  req.on('error', function(e) {
    console.error(e);
  });
};