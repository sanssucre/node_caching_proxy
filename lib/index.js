"use strict";
var crypto = require('crypto');
var caching = require ('./cache')

/*
 Does the actual proxy job by first getting from the cache
 Then goes to origin if the data isn't loaded
*/
class Proxy{
	constructor(configs){
		this.cache = new caching.Cache();
		// Avoid creating an open proxy...
		this.domainAllowed = configs.domains;
	}

  proxy(request, response){

  }

	get(callback, fqdn, url, method) {
    if(! this.isAllowed(fqdn))
      throw new error(host + "is not allowed to proxy on this server");
    let payload = this.cache.get("x");
    if(payload){
      console.log("from cache");
      callback(payload.body);
    } else {
      console.log("fetching");
		  fetch(callback, this);
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


//Move to another file

var http = require('http');
var options = {
  host: 'www.yellowpages.ca',
  port: '80',
  path: '/search/si/1/pizza/Montréal%20QC',
  method: 'GET'
};



// Get's the data from the source
function fetch(callback, proxy){
  var req = http.request(options, function(res) {
  var msg = '';

    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      msg += chunk;
    });
    res.on('end', function() {
      console.log("Caching");
      let payload = new Payload(null,msg);
      proxy.cache.set("x", payload);
      console.log("invoking callback");
      callback(msg);
    });
  });
  req.end();
}

