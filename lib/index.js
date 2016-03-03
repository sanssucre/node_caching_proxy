"use strict";

var caching = require ('./cache')

class Proxy{
	constructor(){
		this.cache = new caching.Cache();
		this.domainAllowed = ["127.0.0.1"];
	}
	
	//It's usually bad form to cary the request around but ...
	get(request) {
		let headers = request.headers;
		let method = request.method;
		let url = request.url;
		let host = request.headers["host"];
		let fqdn = host.substring(0,host.lastIndexOf(":"))
		console.log(fqdn);
		return caching.genKey(host, url, method);
	}
	
}

// Get's the data from the source
function fetch(){
	
}
exports.Proxy = Proxy
