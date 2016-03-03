"use strict";
var crypto = require('crypto');

class Cache {
	
	constructor(){
		this.dataset = {};
		console.log("cache instanciated")
	}
	
	get(key){
		return this.dataset[key];
	}
	
	set(payload){
		this.dataset[payload.key] = payload;
	}
}

class Payload {
	constructor(protocol, fqdn, path, reqParams, headers, body){
		this.protocol = protocol;
		this.fqdn=fqdn;
		this.path=path;
		this.reqParams = reqParams;
		this.headers = headers;
		this.body=body;
	}
	
	key(){
		return "todo: md5hash";
	}
	
	headers(){
		return this.headers;
	}
	
	body(){
		return this.body;
	}
}

// Generate a key from a MD5 hash of the given values
function genKey(host, url, method, postBody){
	let keyParts = host + url + method + postBody;
	return crypto.createHash('md5').update(keyParts).digest('hex');
}

exports.Cache = Cache;
exports.Payload = Payload;
exports.genKey = genKey;