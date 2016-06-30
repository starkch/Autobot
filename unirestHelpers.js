var unirest = require('unirest');
var Promise = require('bluebird');
var credentials = require('./credentials');

var unirestHelper = function() {
  
}

var headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'AutodeskBot',
  'Authorization': 'token ' + credentials.personalToken
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