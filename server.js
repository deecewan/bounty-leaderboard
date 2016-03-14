var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
var slack = require('console-slack');
slack.options = {
  webhook : process.env.SLACK_URL,
  channel : "#debug"
};
var app = express();

var rootRef = new Firebase('https://blistering-torch-5670.firebaseio.com');
rootRef.authWithCustomToken(process.env.FIREBASE_SECRET, function(error, authData){
  if (error) {
    console.slack("Authentication Failed!" + JSON.stringify(error));
  } else {
    console.slack("Authenticated successfully with payload:" + JSON.stringify(authData));
  }
});
var usersRef = rootRef.child('users');

app.use(express.static('public'));
app.use('/bower_components', express.static('bower_components'));

app.get('/', function(req, res){
  res.sendfile('./public/index.html');
});

app.use(bodyParser.json());

app.post('/api/add', function(req,res){
  var id = req.body.uuid.toString();
  usersRef.child(id).once('value', function(snapshot){
    if (snapshot.val()){
      // increment the score
      var data = snapshot.val();
      data.bountyCount++;
      data.bountyScore += req.body.score;
      data.name = req.body.name || data.name;
      usersRef.child(id).update(data, function(err){
        if (err) return res.status(500).json({message: 'An Unexpected Error Occured', details : err});
        return res.status(200).json({message : 'User Updated Successfully.'});
      });
    } else {
      // create a user
      usersRef.child(id).set({
          name : req.body.name,
          bountyScore : req.body.score,
          bountyCount : 1
      }, function(err){
        if (err) return res.status(500).json({message: 'An Unexpected Error Occured', details : err});
        return res.status(200).json({message : 'User Created Successfully.'})
      });
    }
  }, function (errorObject) {
    return res.status(500).json({message : "The read failed: " + errorObject.code});
  });
});

app.listen(3010, function(){
  console.log('Listening on 3010');
});