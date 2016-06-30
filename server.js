var favicon = require('serve-favicon');
var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');

var app = express();
//var passport = require('passport');
//var GitHubStrategy = require('passport-github'),Strategy;
var unirestHelpers = require('./unirestHelpers');

app.set('port', process.env.PORT || 4568);

//var clientId = '2af6ccd261cedaf360a5';
//var secret = "0548851ef57850db3ef27b76606b78743ef4df6f";
//var GitHubApi = require('github');
var unirest = require('unirest');

//var github;
//var user;  
//var _accessToken;

var config = require('./config');

// var username = 'starkch';
// var repo = 'baddocs';
// var baseUrl = "https://github.com/" + username + '/' + repo;
// var apiUrl = "https://api.github.com/repos/" + username + "/" + repo;
// var hookUrl = "http://localhost:4568/webhook";
// var localHostUrl = 'http://1bbd94a2.ngrok.io/webhook';

var initGitHub = function () {
  // github = new GitHubApi({ version: '3.0.0' });
  // github.authenticate({
  //   type: 'oauth',
  //   token: personalToken //_accessToken
  // });
  
     
     var hookFound = false;
     var url = config.apiUrl + "/hooks";
     unirestHelpers.get(url)
      .then(function (response) {
        var hooks = response.body;
        for (var i = 0; i < hooks.length; i++) {
          if (hooks[i].config.url === config.hookUrl ||
              hooks[i].config.url === config.localHostUrl){
            hookFound = true;
            break;
          }
        }
        if (!hookFound) {
          createWebHook(url);
        }
      })
      .catch(function(response) {
        console.error("Error searching for webhook");
        createWebHook(url);
      });
      
      ensureLabels();
      
      
  // var url = "http://api.github.com?access_token=" + personalToken; //_accessToken;
  //   unirest.get(url)
  //     .header('Accept', 'application/json')
  //     .header('Content-Type', 'application/json')
  //     .header('User-Agent', 'starkch')
  //     .end(function (response) {
  //   });


  //   url = "http://api.github.com/user?access_token=" + personalToken;// _accessToken;
  //   unirest.get(url)
  //     .header('Accept', 'application/json')
  //     .header('Content-Type', 'application/json')
  //     .header('User-Agent', 'starkch')
  //     .end(function (response) {
  //       if (!response.error) {
  //         user = response.body;
  //         url = user.repos_url + "?access_token=" + personalToken;// _accessToken;
  //         unirest.get(url)
  //           .header('Accept', 'application/json')
  //           .header('Content-Type', 'application/json')
  //           .header('User-Agent', 'starkch')
  //           .end(function (response) {
  //               //managePullRequests(); 
  //           });
  //       };
  //   });
}

var createWebHook = function(url) {
    var post_data = {
      name: "web",
      active: true,
      events: [
        "push",
        "pull_request"
      ],
      config: {
        url: config.localHostUrl,
        content_type: "application/json"
      }
    };
    
  unirestHelpers.post(url, post_data)
  .then(function (response) {
  })
  .catch(function(response) {
    if (response.error) {
      console.error("Webhook failed :", response.error);
    }
  });
}


var testsPassedLabelTxt = 'testspassed';
var reviewNeededLabelTxt = 'reviewneeded';
var reviewCompletedLabelTxt = 'reviewcompleted';
var manualMergeNeededLabelTxt = 'manualmergeneeded';
var trackedRequestLabelTxt = 'trackedRequest';

var hasLabel = function(name) {
  return new Promise(function(resolve, reject) {
    var listLabelsUrl = config.apiUrl + '/labels/' + name;
    unirestHelpers.get(listLabelsUrl)
    .then(function() {
      return resolve();
    })
    .catch(function() {
      return reject();
    });
  })
  var listLabelsUrl = config.apiUrl + '/labels/' + name;
}
var ensureLabel = function(name, color) {
    hasLabel(name)
    .then(function() {
    })
    .catch(function() {
      var createLabelsUrl = config.apiUrl + '/labels';
      unirestHelpers.post(createLabelsUrl, {name : name, color: color})
      .then(function(response) {
      })
      .catch(function(response) {
        console.error("Unable to create label ", name);
      });
    });
}
var ensureLabels = function() {
  ensureLabel(manualMergeNeededLabelTxt, 'b60205');
  ensureLabel(reviewCompletedLabelTxt, '0e8a16');
  ensureLabel(reviewNeededLabelTxt, 'fbca04');
  ensureLabel(testsPassedLabelTxt, '0e8a16');
  ensureLabel(trackedRequestLabelTxt, 'c5def5');
}


var mergeChange = function (pullRequest) {
  return new Promise(function (resolve, reject) {
    var mergeUrl = pullRequest.url + "/merge";
    unirestHelpers.put(mergeUrl, {"commit_message" : "automatic merge"})
      .then(function (response) {
        if (!response.error) {
          return resolve();
        }
        else {
          addLabel(pullRequest.issue_url, manualMergeNeededLabelTxt)
            .then(function () {
              addComment(pullRequest.issue_url, "Automatic merge failed : Please merge changes manually.")
                .then(function () {
                  return reject();
                });
            });
        }
      })
      .catch(function(response) {
        console.error("Error :", response);
      });
  });
}

var updatePullRequestLabels = function (pullRequest, labels) {
  var testsPassed = false;
  var reviewCompleted = false;
  var needManualMerge = false;
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].name === testsPassedLabelTxt) {
      testsPassed = true;
    }

    if (labels[i].name === reviewCompletedLabelTxt) {
      reviewCompleted = true;
    }

    if (labels[i].name === manualMergeNeededLabelTxt) {
      needManualMerge = true;
    }
  }

  if (!testsPassed) {
    addLabel(pullRequest.issue_url, testsPassedLabelTxt)
      .then(function () {
        addComment(pullRequest.issue_url, "Tests are complete.  Good Job!");
      });  
  }
  else if (reviewCompleted && !needManualMerge) {
    removeLabel(pullRequest.issue_url, reviewNeededLabelTxt)
    .then(function(response) {
      return mergeChange(pullRequest);
    })
    .catch(function(response) {
      return mergeChange(pullRequest);
    });
  }
}

var removeLabel = function (url, label) {
  var labelUrl = url + '/labels/' + label;
  return unirestHelpers.del(labelUrl);
}

var addLabel = function (url, label) {
  var labelUrl = url + '/labels';
  return unirestHelpers.post(labelUrl, [label]);
}

var addComment = function (url, text) {
  var commentsUrl = url + '/comments';
  return unirestHelpers.post(commentsUrl, { "body": "*********  " + text + "  *********" });
}

var trackedRequest = function(labels) {
  if (labels) {
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].name == trackedRequestLabelTxt) {
        return true;
      }
    }
    return false;
  }
}

var updatePullRequest = function (pullRequest) {
  if (pullRequest.state === 'closed') {
    return;
  }

  setTimeout(function() {
    // if this is a new pull requests, (check labels), 
    var url = pullRequest.issue_url + '/labels';
    unirestHelpers.get(url)
    .then(function(response) {
      if (!response.error) {
          var labels = response.body;
          if (!trackedRequest(labels)) {
            addLabel(pullRequest.issue_url, trackedRequestLabelTxt)
            .then(function() {
                        // then append label, add comment
              addComment(pullRequest.issue_url,
                "Thank you for your pull request and contribution.  Your change will be tested and reviewed before it is merged.")
                .then(function () {
                  addLabel(pullRequest.issue_url, reviewNeededLabelTxt);
                })
                .catch(function(response) {
                  console.error("Unable to add comment", response)
                });
            });
          } else {
            // Add label reviewneeded
            updatePullRequestLabels(pullRequest, labels);
          }  
        }
    })
    .catch(function(response) {
      console.error("Error : ", response);
    });
  }, 3000);
}

var managePullRequests = function () {
    var url = config.apiUrl + '/pulls';
    unirestHelpers.get(url)
      .then(function (response) {
        if (!response.error) {
          var pullRequests = response.body;
          for (var i = 0; i < pullRequests.length; i++) {
            updatePullRequest(pullRequests[i]);
          }
        };
      })
      .catch(function(response) {
        console.error("Error : ", response);
      });
  
  //setTimeout(managePullRequests, 15000);
}

app.use(bodyParser.json());
app.use(favicon(__dirname + '/images/favicon.ico'));

// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));


app.get('/', function(req, res) {

  res.render('index');
});

app.post('/webhook', function (req, res) {
  if (req.body && req.body.payload) {
    var body = JSON.parse(req.body.payload);
    if (body.pull_request && body.action !== 'unlabeled' && body.action !== 'closed') {
      updatePullRequest(body.pull_request);
    }
  }
  res.end();
});

app.get('/repositories', function (req, res) {
  if (!user) {
    res.send(401, "No user logged in.");
    return;
  }
  unirest.get(user.repos_url)
    .end(function (response) {
      res.end(JSON.stringify(response.body));
    });
});

app.get('/pullrequests', function (req, res) {
  if (!user) {
    res.send(401, "No user logged in.");
    return;
  }

  unirest.get(user.repos_url)
    .then(function (response) {
      res.end(JSON.stringify(response.body));
    });
});


console.log('GithubManager is listening on 4568');
var server = app.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
});
server.timeout = 600000;

initGitHub();