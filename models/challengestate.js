
var mongoose = require('mongoose');
var Challenge = mongoose.model('challenges', require('challenge').challengeSchema);
var User = mongoose.model('userauths', require('user').userSchema);

exports.challengeStateSchema = new mongoose.Schema({
    username: String,
    cid: { type: Number, unique: true },
    hintcount: Number,
    solved: {type: String, default: 'false'}
  });

var ChallengeState = mongoose.model('challengestate', exports.challengeStateSchema);

exports.getChallengeState = function(username, cid, done){
  Challenges.findOne({ username : username, cid : cid }, done);
};

exports.updateChallengeStateSolved = function(username, cid, solved, done){
  var query = { username : username, cid : cid };
  ChallengeState.update(query, { $set: { solved : solved } }, null, function(err, numAffected){
    if(err) done(err);
    done(null);
  });
};

exports.updateChallengeStateHints = function(username, cid, hintcount, done){
  var query = { username : username, cid : cid };
  ChallengeState.update(query, { $set: { hintcount : hintcount } }, null, function(err, numAffected){
    if(err) done(err);
    done(null);
  });
};

exports.newChallengeState = function(cid, username, done){
  ChallengeState.create({
    cid : cid,
    username : username,
    hintcount : 0
    }, function(err, challengestate){
      if(err) done(err);
      else done(null, challengestate);
    }
}

exports.checkAndUpdateUserAnswer = function(cid, username, answer, done){
  //if user exists
    //if challenge exists
      //if challenge.answer == answer
        //update solved to true, get the hintcount
        //get the user score
        //set user score to old score+ challenge base score - hintcount*modifier
}




