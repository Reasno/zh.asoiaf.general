var bot = require('nodemw');
// read config from external file
var zh = new bot({
	"server": "zh.asoiaf.wikia.com", 
	"path": "",                  
	"debug": true,               
	"username": process.env.USERNAME,         
	"password": process.env.PASSWORD,          
	"userAgent": "zh.asoiaf.image",    
	"concurrency": 10              
});
var en = new bot({
	"server": "awoiaf.westeros.org", 
	"path": "",                  
	"debug": true,               
	"username": process.env.EN_USERNAME,         
	"password": process.env.EN_PASSWORD,          
	"userAgent": "zh.asoiaf.image",    
	"concurrency": 10              
});
var lg = false;

var stash = [];
var image_borrow = function(){
	var self = this;	
	self.execute = function() {
		try{

			zh.logIn(function(data){
				console.log(data);
				var login  = JSON.parse(JSON.stringify(data)) ;
				if(login.result == 'Success'){
					lg = true;
				}else{
					lg = false;
					return;
				}
				try{
					where_are_my_dragons(zh);
				}catch(err){
					try{
						where_are_my_dragons(zh);
					}catch(err){
						return
					}
				}
				
			});
		}catch(err){

		}
	}

	var where_are_my_dragons = function(bot) {
		console.log('all images');
		
		_getAllImage(en,true,'json',function(){
			console.log('done');
		});

	}
	  /*
   * data: raw data get from api
   * res: dict object
   */ 
   var read = function(data, res) {
   	var images = data.query.allimages;
   	for (var iid in images) {
   		var image = images[iid];
   		var name = image.name;
   		var url = image.url;
   		var desc = image.descriptionurl;
   		stash.push(image);
   		// console.log('passing'+name);
   		if (url != undefined) {
	      	//do we have this?
	      	try{
	      		var params = {
	      			action :'query',
	      			titles : name,
	      			format : 'json'
	      		}
	      		zh.api.call(params,function(info,next,data){
	      			//console.log(data);
	      			if(data.query.pages['-1']){
	      				//console.log('not existed');
		      			for (var index = 0; index < stash.length; index++) {
		      				if(stash[index].name == data.query.pages['-1'].title){
		      					zh.uploadByUrl(stash[index].name, stash[index].url, 'zh.asoiaf.image: image migrated from '+stash[index].descriptionurl /* or extraParams */, function(){
		      						console.log(name+' Migrated');
		      					});
		      				}
		      	
		      				
		      			}
					}
	      		});
	      	}catch(err){

	      	}

	    } 
	}
	return res;
   };

	  /*
	   * res: dict object
	   */
	   var writeFile = function(res, filename, format) {
	   };
	   var _getAllImage = function(client, isBot, format, callback) {
			   	console.log('I am here');
			   	var res = {
			   		'dict': {}, 
			   		'noen': [], 
			   		'error': {}
			   	};
			   	var reqAll = {
			   		params: {
			   			action: 'query', 
			   			list: 'allimages', 
			   			aifrom : '',
			   			ailimit: (isBot) ? '5000' : '500',
			   			format : 'json'
			   		}, 
			   		errCnt: 0, 
			   		timeout: undefined
			   	};
			   	var log = function(info) {
			   		console.log('[getAll] ' + info);
			   	};    
			   	var waitTimeout = function() {
			   		if (reqAll.timeout) {
			   			clearTimeout(reqAll.timeout);
			   			reqAll.timeout = undefined;
			   			var err = 'Timeout, try again...';
			   			log(err);
			   			callApi(err, apiCallback);
			   		}
			   	};    
			   	var callApi = function(err, apiCallback) {
			   		if (err) {
			   			if (reqAll.errCnt > 3) {
			   				log('Retry 3 times...FAILED.');
			   				return;
			   			} else {
			   				reqAll.errCnt++;
			   			}
			   		} else {
			   			reqAll.errCnt = 0;
			   		}
			   		client.api.call(reqAll.params, apiCallback); 
				    reqAll.timeout = setTimeout(waitTimeout, 10000); // wait for 10 seconds until TIMEOUT
				};
				var apiCallback = function(info, next, data) {
				      if (!reqAll.timeout) { // timeout has been cleared, this callback is called after TIMEOUT, discard it
				      	log('Callback returned after TIMEOUT, discard it...');
				      	return;
				      }
				      clearTimeout(reqAll.timeout);
				      reqAll.timeout = undefined;
				      if (data) {
				      	if (!data.query) {
				      		var err = 'Error or warning occured, plz check parameters again.';
				      		log(err);
				      		callApi(err, apiCallback);
				      	} else {
				      		if (data['query-continue']) {
				      			read(data, res);
				      			log('query-continue');
				      			reqAll.params.aifrom = data['query-continue'].allimages.aifrom;
				      			callApi('', apiCallback);
				      		} else {
				      			read(data, res);
				      			writeFile(res, 'dict-all', format);
				      			if (callback) {
				      				callback(res);
				      			}
				      		}
				      	}
				      } else {
				      	var err = 'No data received in this call, try again...';
				      	log(err);
				      	callApi(err, apiCallback);
				      }
				};
		  		callApi('', apiCallback);
		};

	}

	module.exports = image_borrow;
