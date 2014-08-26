var http = require('http');
var express = require('express');
var schedule = require('node-schedule');
var bodyParser = require('body-parser')
var ds = require('./ds.js');
var rename = require('./rename.js');
var image_borrow = require('./image.js');
var category = require('./category.js');
var redirect = require('./redirect.js');
var redirect_instance  = new redirect();
var ds_instance = new ds();
var rename_instance = new rename();
var cat_instance = new category();
var image_borrow_instance = new image_borrow();
var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies

app.get('/ds', function(req, res) {
  ds_instance.execute();
  // ds_ass_instance.execute();
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
app.get('/redirect', function(req, res) {
  redirect_instance.execute();
  res.send('Hello World!');
});
app.post('/rename', function(req, res) {
  //console.log(req);
  rename_instance.execute(req.body.oldName, req.body.newName);
  res.redirect('back');
});
app.post('/category', function(req, res) {
  //console.log(req);
  rename_instance.execute(req.body.enName, req.body.zhName);
  res.redirect('back');
});
var exclusiveFlag = false;
var port = process.env.PORT || 5577;
var server = app.listen(port, function() {
	console.log('Server start...');
  //call('/rename');
  //call('/redirect');
  //call('/image_borrow');
	//call('/category');
	//setInterval(call('/ds'),process.env.SERVICE_INTERVAL||180000);
  /* weekly task */
	var weekly = schedule.scheduleJob({hour: 14, minute: 30, dayOfWeek: 2}, function(){
      exclusiveFlag = true;
		  call('/image_borrow');
	    console.log('The answer to life, the universe, and everything!');
	});
  var weeklyWindowClosure = schedule.scheduleJob({hour: 15, minute: 20, dayOfWeek: 2}, function(){
      exclusiveFlag = false;
  });
  /* daily task */
  var daily = schedule.scheduleJob({hour: 2, minute: 30}, function(){
      exclusiveFlag = true;
      call('/redirect');
      console.log('The answer to life, the universe, and everything!');
  });
  var dailyWindowclosure = schedule.scheduleJob({hour: 3, minute: 20}, function(){
      exclusiveFlag = false;
  });
  /* regular task */
	var secondly= schedule.scheduleJob({second:30}, function(){
      if(!exclusiveFlag){
  		  call('/ds');
  	    console.log('The answer to life, the universe, and everything!');
      }
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