"use strict";
var http = require('http');
var services = require('./lib');
var configs = require('config');

var proxy = new services.Proxy(configs.domains);

var server = http.createServer(function (request, response) {
    //console.log(request)
    proxy.proxy(request, response);
});
server.listen(8080);


