"use strict";

// Simple implementation.  Need to introduce a plugable impl
class Cache {

	constructor(){
		this.dataset = {};
		console.log("using  simple cache")
	}

	get(key){
		return this.dataset[key];
	}

	set(key, payload){
		this.dataset[key] = payload;
	}
}

exports.Cache = Cache;
