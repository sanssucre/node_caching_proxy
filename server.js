"use strict";
var http = require('http');
var service = require('./lib');



var proxy = new service.Proxy();

var server = http.createServer(function(request, response) {
	response.setHeader('Content-Type', 'text/plain');
	response.write(proxy.get(request) + "\n");
	response.end();
});
console.log("listening")
server.listen(8080);