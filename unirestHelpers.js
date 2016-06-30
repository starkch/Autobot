var unirest = require('unirest');
var Promise = require('bluebird');

// Public github
//var personalToken = "dca9383003c26394d1a3fa61ed68c99d35f11123";

// Enterprise, Autodesk, github starkc
var personalToken = "a455cbed7d17458ba2e01fb32abf87c7cfbe0663";
//nick
//var personalToken = "931aeed3f39080f10d40597971f477149facd042";

var unirestHelper = function() {
  
}

var headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'AutodeskBot',
  'Authorization': 'token ' + personalToken
};

unirestHelper.prototype.get = function(url) {
  return new Promise(function(resolve, reject){
    unirest.get(url)
    .headers(headers)
    .end(function (response) {
        if (!response.error) {
          return resolve(response);
        }
        else {
          return reject(response);
        }
    });
  });
}

unirestHelper.prototype.del = function(url) {
  return new Promise(function(resolve, reject){
    unirest.delete(url)
    .headers(headers)
    .end(function (response) {
        if (!response.error) {
          return resolve(response);
        }
        else {
          return reject(response);
        }
    });
  });
}

unirestHelper.prototype.post = function(url, data) {
  return new Promise(function(resolve, reject){
    unirest.post(url)
      .headers(headers)
      .send(data)
      .end(function (response) {
        if (!response.error) {
          return resolve(response);
        }
        else {
          return reject(response);
        }
      });
  });
}

unirestHelper.prototype.put = function(url, data) {
  return new Promise(function(resolve, reject){
    unirest.put(url)
      .headers(headers)
      .send(data)
      .end(function (response) {
       if (!response.error) {
          return resolve(response);
        }
        else {
          return reject(response);
        }
      });
  });
}

module.exports = new unirestHelper();