var $ = require('jquery');
var request = require('request');

var personalToken = "dca9383003c26394d1a3fa61ed68c99d35f11123";
var baseUrl = "http://api.github.com/repos/starkch/baddocs";
var url = baseUrl + "/hooks?access_token=" + personalToken;

      var post_data = {
          name: "web",
          active: true,
          events: [
            "push",
            "pull_request"
          ],
          config: {
            url: "http://27050f98.ngrok.io/webhook",
            content_type: "application/json"
          }
        };
        
      console.log(JSON.stringify(post_data));
     request(
     {
        url: url,
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent':'starkch'
          //   Accept: 'application/json',
          //   'Content-Type' : 'application/octet-stream',
          //Authorization: 'Bearer ' + self.accessToken
        },
      data: JSON.stringify(post_data),
     },
      function (err, response) {
              console.log(err);
      }
    );
