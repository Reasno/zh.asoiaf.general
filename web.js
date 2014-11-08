var http = require('http');
var express = require('express');
var schedule = require('node-schedule');
var bodyParser = require('body-parser')
var ds = require('./ds.js');
var rename = require('./rename.js');
var image_borrow = require('./image.js');
var category = require('./category.js');
var redirect = require('./redirect.js');
var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies

app.get('/ds', function(req, res) {
  var ds_instance = new ds();
  ds_instance.execute();
  // ds_ass_instance.execute();
  res.send('Hello World!');
});
app.get('/image_borrow', function(req, res) {
  var image_borrow_instance = new image_borrow();
  image_borrow_instance.execute();
  res.send('Hello World!');
});
app.get('/redirect', function(req, res) {
  var redirect_instance  = new redirect();
  redirect_instance.execute();
  res.send('Hello World!');
});
app.post('/rename', function(req, res) {
  //console.log(req);
  if(req.body.password==process.env.PASSWORD){
    var rename_instance = new rename();
    rename_instance.execute(req.body.oldName, req.body.newName);
    res.redirect('back');
  }else{
    res.send('</html>密码错误</html>');
  }

});
app.post('/category', function(req, res) {
  if(req.body.password==process.env.PASSWORD){
    var cat_instance = new category();
    cat_instance.execute(req.body.enName, req.body.zhName, req.body.isImage);
    res.redirect('back');
  }else{
    res.send('</html>密码错误</html>');
  }
});
var exclusiveFlag = false;
var port = process.env.PORT || 5577;
var server = app.listen(port, function() {
	console.log('Server start...');
	
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