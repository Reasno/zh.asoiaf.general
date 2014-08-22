/* Please ignore all dict prototype. It is copied from Chenyang‘s zh.asoiaf.dict */
  var bot = require('nodemw');  //var fs = require('fs');
  var isBot = true;
  var client = new bot({
    "server": "zh.asoiaf.wikia.com", 
    "path": "",                  
    "debug": true,               
    "username": process.env.USERNAME,         
    "password": process.env.PASSWORD,          
    "userAgent": "zh.asoiaf.DS",    
    "concurrency": 10              
  });
var redirect = function() {


  // var dict = function() {
  //   this.isBot = false;
  //   this.client = new bot({
  //     "server": "zh.asoiaf.wikia.com", 
  //     "path": "",                  
  //     "debug": true,               
  //     "username": process.env.USERNAME,         
  //     "password": process.env.PASSWORD,          
  //     "userAgent": "zh.asoiaf.DS",    
  //     "concurrency": 1              
  //   });
  // };
  var lg = false;
  var self = this;
  self.execute = function() {
    try{

      client.logIn(function(data){
        console.log(data);
        _getAll(client, isBot, "JSON", function(data){});
      });
    }catch(err){

    }
  
  }  
  // dict.prototype = {
  //   getAll: function(callback) {
  //     if (this.isBot) {
  //       if (this.isLogin !== true) {
  //         var that = this;
  //         this.client.logIn(function() {
  //           _getAll(that.client, that.isBot, that.format, callback);
  //           that.isLogin = true;
  //         });
  //         return;
  //       }
  //     }
  //     _getAll(this.client, this.isBot, this.format, callback);
  //   }, 
  //   getCategory: function(categoryName, callback) {
  //     if (this.isBot) {
  //       if (this.isLogin !== true) {
  //         var that = this;
  //         this.client.logIn(function() {
  //           _getCategory(categoryName, that.client, that.isBot, that.format, callback);
  //           that.isLogin = true;
  //         });
  //         return;
  //       }
  //     }
  //     _getCategory(categoryName, this.client, this.isBot, this.format, callback);
  //   }, 
  //   /* push to MediaWiki/Common.js/dict */
  // //   push: function(pushTitle, callback) {
  // //     if (fs.existsSync('dict-all.json')) {
  // //       _push(pushTitle, this.client, callback);
  // //     } else {
  // //       var that = this;
  // //       _getAll(this.client, this.isBot, this.format, function(res) {
  // //         _push(pushTitle, that.client, callback);
  // //       });
  // //     }
  // //   }, 
  // //   /* push to Template:zh-en */
  // //   pushZhEn: function(pushTitle, callback) {
  // //     if (fs.existsSync('res.json')) {
  // //       _pushZhEn(pushTitle, this.client, callback);
  // //     } else {
  // //       var that = this;      
  // //       _getAll(this.client, this.isBot, this.format, function(res) {
  // //         _pushZhEn(pushTitle, that.client, callback);
  // //       });
  // //     }
  // //   }, 
  // //   /* push to Template:en-zh */
  // //   pushEnZh: function(pushTitle, callback) {
  // //     if (fs.existsSync('res.json')) {
  // //       _pushEnZh(pushTitle, this.client, callback);
  // //     } else {
  // //       var that = this;      
  // //       _getAll(this.client, this.isBot, this.format, function(res) {
  // //         _pushEnZh(pushTitle, that.client, callback);
  // //       });
  // //     }
  // //   }
  // };

  var _getAll = function(client, isBot, format, callback) {
    var res = {
      'dict': {}, 
      'noen': [], 
      'error': {}
    };
    var reqAll = {
      params: {
        action: 'query', 
        generator: 'allpages', 
        gaplimit: (isBot) ? '1000' : '100', 
        prop: 'langlinks', 
        lllimit: (isBot) ? '5000' : '500'
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
      reqAll.timeout = setTimeout(waitTimeout, 300000); // wait for 300 seconds until TIMEOUT
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
            /* modified by reasno 2014-08-22 */
            read(data, res, client);
            /* end of modification */
            log('query-continue');
            reqAll.params.gapfrom = data['query-continue'].allpages.gapfrom;
            callApi('', apiCallback);
          } else {
            /* modified by reasno 2014-08-22 */
            read(data, res, client);
            /* end of modification */
            //writeFile(res, 'dict-all', format);
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

  var _getCategory = function(categoryName, client, isBot, format, callback) {
    var res = {
      'dict': {}, 
      'noen': [], 
      'error': {}
    };  
    // TODO: cmcontinue
    var reqCat = {
      params: {
        action: 'query', 
        generator: 'categorymembers', 
        gcmtitle: 'Category:' + categoryName, 
        gcmlimit: (isBot) ? '5000' : '100', 
        prop: 'langlinks', 
        lllimit: (isBot) ? '5000' : '500'
      }, 
      errCnt: 0, 
      timeout: undefined
    };
    var log = function(info) {
      console.log('[getCategory] ' + info);
    };    
    var waitTimeout = function() {
      if (reqCat.timeout) {
        clearTimeout(reqCat.timeout);
        reqCat.timeout = undefined; //I need something more forgiving...
        var err = 'Timeout, try again...';
        log(err);
        callApi(err, apiCallback);
      }
    };    
    var callApi = function(err, apiCallback) {
      if (err) {
        if (reqCat.errCnt > 3) {
          log('Retry 3 times...FAILED.');
          return;
        } else {
          reqCat.errCnt++;
        }
      } else {
        reqCat.errCnt = 0;
      }
      client.api.call(reqCat.params, apiCallback); 
      reqCat.timeout = setTimeout(waitTimeout, 300000); // wait for 300 seconds until TIMEOUT
    };
    var apiCallback = function(info, next, data) {
      if (!reqCat.timeout) { // timeout has been cleared, this callback is called after TIMEOUT, discard it
        log('Callback returned after TIMEOUT, discard it...');
        return;
      }
      clearTimeout(reqCat.timeout);
      reqCat.timeout = undefined;
      if (data) {
        if (!data.query) {
          var err = 'Error or warning occured, plz check parameters again.';
          log(err);
          callApi(err, apiCallback);
        } else {
          /* modified by reasno 2014-08-22 */
          read(data, res, client);
          /* end of modification */
          // writeFile(res, 'dict-' + categoryName, format);
          if (callback) {
            callback(res);
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

  // var _push = function(pushTitle, client, callback) {
  //   var content = fs.readFileSync('./dict-all.json', { encoding: 'utf-8' });
  //   client.edit(pushTitle, content, 'sync by zh.asoiaf.Dict.Sync', function(res) {
  //     console.log(res);
  //     if (callback) {
  //       callback();
  //     }
  //   });
  // };  
  // var _pushZhEn = function(pushTitle, client, callback) {
  //   var res = JSON.parse(fs.readFileSync('./res.json', { encoding: 'utf-8' }));
  //   var crlf = '\r\n';
  //   var content = '<includeonly>{{#switch: {{{1}}}' + crlf;
  //   var dict = res.dict;
  //   for (var item in dict) {
  //     var line = ' | ' + item + ' = ' + dict[item] + crlf;
  //     content += line;
  //   }
  //   content += ' | #default = {{{1}}}' + crlf + '}}' + crlf + '</includeonly>';
  //   client.edit(pushTitle, content, 'sync by zh.asoiaf.Dict.Sync', function(res) {
  //     console.log(res);
  //     if (callback) {
  //       callback();
  //     }
  //   });
  // };
  // var _pushEnZh = function(pushTitle, client, callback) {
  //   var res = JSON.parse(fs.readFileSync('./res.json', { encoding: 'utf-8' }));
  //   var crlf = '\r\n';
  //   var content = '<includeonly>{{#switch: {{{1}}}' + crlf;
  //   var dict = res.dict;
  //   for (var item in dict) {
  //     var line = ' | ' + dict[item] + ' = ' + item + crlf;
  //     content += line;
  //   }
  //   content += ' | #default = {{{1}}}' + crlf + '}}' + crlf + '</includeonly>';
  //   client.edit(pushTitle, content, 'sync by zh.asoiaf.Dict.Sync', function(res) {
  //     console.log(res);
  //     if (callback) {
  //       callback();
  //     }
  //   });  
  // };
  /*
   * data: raw data get from api
   * res: dict object
   */ 

  var getValue = function(title){
    client.getArticle(title, function(data){
      client.expandTemplates("$$$"+title+"$$$"+data, title, function(data){
        var target = client.getTemplateParamFromXml(data, "Alias");
        console.log(target);
        data = data.trim().replace('-', '\\-');
        var re = new RegExp('\\$\\$\\$([^>]+)\\$\\$\\$');
        var matches = data.match(re);
        var title = matches && matches[1].trim() || false;
        console.log(title);
        if(target && title && target != ""){
          var aliases = target.split(/\&lt\;br\s*\/?\&gt\;/g);
          for(var a in aliases) {
            if (!aliases[a]||aliases[a].trim()===""){
              break;
            }
            console.log(title+"<-"+aliases[a]);
            try{
              var redirectPage = aliases[a].trim().replace("[","","g").replace("]","","g").replace("{","","g").replace("}","","g").replace(/(<([^>]+)>)/ig,"");
              setTimeout(client.edit(redirectPage+"("+title+")", "#REDIRECT [["+title+"]]", "zh.asoiaf.redirect", function(data){console.log(aliases[a].trim()+'Alias edit made');}),5000);
              //strip strip strip

            }catch(err){
              console.log(err);
            }
          }
        }
      })
    })
  }
  var read = function(data, res, client) {
    var pages = data.query.pages;
    for (var pid in pages) {
      var page = pages[pid];
      var title = page.title;
      var langlinks = page.langlinks;
      // var aliasHandler = function(data){
      //   if(data){
      //     var aliases = data.split(/<.+>/g);
      //     for(var a in aliases) {
      //       setTimeout(client.edit(aliases[a].trim(), "#REDIRECT [["+title+"]]", "zh.asoiaf.redirect", function(data){console.log(aliases[a].trim()+'edit made');}),5000);
      //     }
      //   }
      // }
      getValue(title);
      if (langlinks != undefined) {
        for (var i = 0; i < langlinks.length; ++i) {
          var lang = langlinks[i];
          if (lang.lang == 'en') {
            // TODO: check ERROR 
            res.dict[title] = lang['*'];
            break;
          }
        }
        if (res.dict[title] == undefined) {
          //res.noen.push(title);
        }else{
          try{
            if (res.dict[title]!=""){
              setTimeout(client.edit(res.dict[title], "#REDIRECT [["+title+"]]", "zh.asoiaf.redirect", function(data){console.log('English name edit made');}),5000);
            }
          }catch(err){
            console.log(err);//ignore errs.
          }
          /* End of Modification */
        }
      } else {
        //res.noen.push(title);
      }
    }
    return res;
  };
  /* End of Modification */
  /*
   * res: dict object
   */
  // var writeFile = function(res, filename, format) {
  //   format = format || 'json';
  //   console.log('Start writing into file...' + format);
  //   var genTimestamp = function() {
  //     var addZero = function(num) {
  //       return (num < 10) ? '0' + num : '' + num;
  //     }
  //     var d = new Date();
  //     return '' + d.getUTCFullYear() + addZero(d.getUTCMonth() + 1) + addZero(d.getUTCDate()) 
  //       + addZero(d.getUTCHours()) + addZero(d.getUTCMinutes()) + addZero(d.getUTCSeconds());
  //   };
  //   var writeSimple = function() {
  //     var crlf = '\r\n';
  //     if (res.dict) {
  //       var content = '';
  //       for (var item in res.dict) {
  //         var line = res.dict[item] + '#' + item + crlf;
  //         content += line;
  //       }
  //       fs.writeFileSync(filename + '.txt', content);
  //       console.log(filename + '.txt, DONE.');
  //     }
  //     if (res.noen.length != 0) {
  //       var content = '';
  //       for (var i = 0; i < res.noen.length; ++i) {
  //         content += res.noen[i] + crlf;
  //       }
  //       fs.writeFileSync(filename + '-noen.txt', content);
  //       console.log(filename + '-noen.txt, DONE.');
  //     }          
  //     if (res.error) {
  //       var content = '';
  //       for (var item in res.error) {
  //         var line = res.error[item] + '#' + item + crlf;
  //         content += line;
  //       }
  //       fs.writeFileSync(filename + '-error.txt', content);
  //       console.log(filename + '-error.txt, DONE.');
  //     }
  //   };
  //   var writeJson = function() {
  //     var flip = function(o) {
  //       if (o) {
  //         var fo = {};
  //         for (var key in o) {
  //           fo[o[key]] = key;
  //         }
  //         return fo;
  //       }
  //     };
  //     var jsonOutput = function(json, filename) {
  //       json['__TIMESTAMP__'] = genTimestamp();
  //       var jsonStr = JSON.stringify(json);
  //       fs.writeFileSync(filename + '.json', jsonStr);
  //       console.log(filename + '.json DONE.');
  //     };
  //     if (res.dict) {
  //       var fdict = flip(res.dict); // flip dict...
  //       jsonOutput(fdict, filename);
  //     }
  //     if (res.noen.length != 0) {
  //       jsonOutput(res.noen, filename + '-noen');
  //     }
  //     if (res.error) {
  //       var ferror = flip(res.error);
  //       jsonOutput(ferror, filename + '-error');
  //     }        
  //   };
  //   if (format == 'simple') {
  //     writeSimple();
  //   } else if (format == 'json') {
  //     writeJson();
  //   }
  //   /* write res into file */
  //   var resJsonStr = JSON.stringify(res);
  //   fs.writeFileSync('res.json', resJsonStr);
  //   console.log('res.json DONE.');
  // };
  
  // return dict;  
}

module.exports = redirect;