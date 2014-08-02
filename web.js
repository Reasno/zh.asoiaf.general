var http = require('http');
var express = require('express');
var schedule = require('node-schedule');
var ds = require('./ds.js');
var ds_instance = new ds();
var app = express();
app.get('/ds', function(req, res) {
  ds_instance.execute();
  res.send('Hello World!');
});


var port = process.env.PORT || 5577;
var server = app.listen(port, function() {
	console.log('Server start...');
	var rule = new schedule.RecurrenceRule();
	rule.second = 1;
	var j = schedule.scheduleJob(rule, function(){
		call();
	    console.log('The answer to life, the universe, and everything!');
	});
});

var call = function() {
  var option = {
    host: 'localhost', 
    port: port, 
    path: '/ds', 
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