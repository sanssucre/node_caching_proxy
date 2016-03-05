"use strict";
var crypto = require('crypto');
var caching = require ('./cache')

/*
 Does the actual proxy job by first getting from the cache
 Then goes to origin if the data isn't loaded
*/
class Proxy{
	constructor(domains){
		this.cache = new caching.Cache();
		// Avoid creating an open proxy...
		this.domainAllowed = domains;
	}

	proxy(fqdn, url, method, callback) {
    console.log(fqdn + " " + url + " " + method);
    let key = genKey(fqdn,url,method);
    let payload = this.cache.get(key);
    if(payload)
      callback(payload.body);
     else{
      let proxy = this;
		  fetch(function(msg){
        callback(msg);
        let payload = new Payload(null,msg);
        proxy.cache.set(key,payload);
      });
    }
	}

  isAllowed(fqdn){
    return this.domainAllowed[fqdn];
  }

}

/*
  This is a value object to be stored
  and retrieve in/from the cache
*/
class Payload {
	constructor(headers, body){
		this.headers = headers;
		this.body=body;
	}
}

// Generate a key from a MD5 hash of the given values
function genKey(host, url, method, postBody){
	let keyParts = host + url + method + postBody;
	return crypto.createHash('md5').update(keyParts).digest('hex');
}


exports.Proxy = Proxy
exports.Payload = Payload;
exports.genKey = genKey;


//Move to another file?

var http = require('http');
var options = {
  host: 'www.yellowpages.ca',
  port: '80',
  path: '/search/si/1/pizza/Montréal%20QC',
  method: 'GET'
};



// Get's the data from the source
function fetch(callback){
  var req = http.request(options, function(res) {
  var msg = '';

    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      msg += chunk;
    });
    res.on('end', function() {
      callback(msg);
    });
  });
  req.end();
}

