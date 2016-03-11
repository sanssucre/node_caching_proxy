"use strict";
var crypto = require('crypto');
var caching = require('./cache');
var fetch = require('node-fetch');

let _403_key = "403";
/*
 Does the actual proxy job by first getting from the cache
 Then goes to origin if the data isn't loaded
 */
class Proxy {

    // Avoid creating an open proxy by loading the domains allowed from configurations (domainConfigs).
    constructor(domainConfigs) {
        this.cache = new caching.Cache();
        this.domainConfigs = domainConfigs;
        this.cache.set(_403_key, new Payload({"content-type": "text/plain"}, "go away you leach \n", 403));
    }

    proxy(request, response) {
        let reqParser = new RequestParser(request, this.domainConfigs);
        let key = reqParser.isAllowed() ? reqParser.getCacheKey() : _403_key;
        let payload = this.cache.get(key);
        let respHandler = new ResponseHandler(response);
        if (payload)
            respHandler.respond(payload);
        else {
            let proxy = this;
            this.gotoOrigin(reqParser, respHandler, key);
        }
    }

    gotoOrigin(respParser, respHandler, key) {
        let that = this;
        let payload = new Payload();
        fetch(respParser.url).then(function (res) {
            payload.headers = res.headers.raw();
            payload.statusCode = res.status;
            return res.text();
        }).then(function (body) {
            payload.body = body;
            respHandler.respond(payload);
            that.cache.set(key, payload);
        });
    }
}

/*
 Simple wrapper to process the response
 */
class ResponseHandler {
    constructor(response) {
        this.response = response;
    }

    respond(payload) {
        this.response.statusCode = payload.statusCode;
        for (let key in payload.headers) {
            this.response.setHeader(key, payload.headers[key]);
        }
        this.response.write(payload.body);
        this.response.end();
    }
}

/*
 Wrapper class around the request being processed to
 extract the meta informations.
 */
class RequestParser {

    constructor(request, domainConfigs) {
        this.request = request;
        this.fqdn = this.stripPortInfo(request.headers["host"]);
        this.domainConfig = domainConfigs[this.fqdn];
        if (this.domainConfig) {
            let protocol = (this.domainConfig["protocol"] ? this.domainConfig["protocol"] : "http") + "://";
            this.url = protocol + this.domainConfig["origin"] + request.url;//'/search/si/1/pizza/Montréal%20QC';
        }
        console.log(this.fqdn + " " + this.url + " " + request.method);
    }

    stripPortInfo(host) {
        let indexOfSemiColon = host.lastIndexOf(":");
        if (indexOfSemiColon > -1)
            return host.substring(0, indexOfSemiColon);
        return host;
    }

    isAllowed() {
        return !!this.domainConfig;

    }

    /*
     The post body is optional.  If the content being cached is the result
     of a post then the post payload must be part of the key
     */
    getCacheKey(postBody) {
        let keyParts = this.host + this.url + this.request.method;
        if (postBody)
            keyParts += crypto.createHash('md5').update(postBody).digest('hex');

        return keyParts;
    }
}

/*
 This is a dumb value object to wrap  the source response
 it is what actually gets stored in the cache
 */
class Payload {
    constructor(headers, body, statusCode) {
        this.headers = headers;
        this.body = body;
        this.statusCode = statusCode ? statusCode : 200;
    }
}

exports.Proxy = Proxy;


