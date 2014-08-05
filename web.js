var http = require('http');
var express = require('express');
var schedule = require('node-schedule');
var ds = require('./ds.js');
var ds_ass = require('./ds-ass.js');
var image_borrow = require('./image.js');
var category = require('./category.js');
var ds_instance = new ds();
var cat_instance = new category();
var ds_ass_instance = new ds_ass();
var image_borrow_instance = new image_borrow();
var app = express();
app.get('/ds', function(req, res) {
  ds_instance.execute();
  ds_ass_instance.execute();
  res.send('Hello World!');
});
app.get('/image_borrow', function(req, res) {
  image_borrow_instance.execute();
  res.send('Hello World!');
});
app.get('/category', function(req, res) {
  cat_instance.execute();
  res.send('Hello World!');
});


var port = process.env.PORT || 5577;
var server = app.listen(port, function() {
	console.log('Server start...');
	//call('/category');
	call('/image_borrow');
	//setInterval(call('/ds'),process.env.SERVICE_INTERVAL||180000);
	var j = schedule.scheduleJob({hour: 14, minute: 30, dayOfWeek: 2}, function(){
		call('/image_borrow');
	    console.log('The answer to life, the universe, and everything!');
	});
	var jj = schedule.scheduleJob({second:2}, function(){
		//call('/ds');
	    console.log('The answer to life, the universe, and everything!');
	});
});

var call = function(my_path) {
  var option = {
    host: 'localhost', 
    port: port, 
    path: my_path, 
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