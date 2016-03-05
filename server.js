"use strict";
var http = require('http');
var services = require('./lib');
var configs = require('config');

var proxy = new services.Proxy(configs.domains);

var server = http.createServer(function(request, response) {
  let rInfo = new RequestDomainInfo(request);

  if(! proxy.isAllowed(rInfo.fqdn)){
    response.setHeader('Content-Type', 'text/plain');
    response.statusCode = 401;
    response.write("go away you leach \n");
    response.end();
  }else{
    proxy.proxy(rInfo.fqdn, rInfo.url, request.method, function(payload){
      response.write(payload);
      response.end();
    });
  }
});
server.listen(8080);

// Wrapper class to parse the request
class RequestDomainInfo {
  constructor(request){
    /*
    for(var key in request.headers)
      console.log(key + " = " + request.headers[key]);
    */
    this.host = request.headers["host"];
    this.fqdn = this.host;
    let indexOfSemiColon = this.host.lastIndexOf(":");
    if(indexOfSemiColon>-1)
      this.fqdn = this.host.substring(0,indexOfSemiColon);
    let protocol = request.protocol? request.protocol : "http://";
    this.url = protocol + this.host + request.url;
  }
}
