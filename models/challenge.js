
var mongoose = require('mongoose');
var crypto = require('crypto');

exports.challengeSchema = new mongoose.Schema({
    cid: { type: Number, unique: true },
    date: { type: Date,  default: Date.now },
    answer: String,
    ciphertext: String
  });

var Challenges = mongoose.model('challenges', exports.challengeSchema);

exports.getChallenge = function(cid, done){
  Challenges.findOne({ cid : cid }, done);
}

exports.newChallenge = function(cid, answer, ciphertext, done){

   var slength = 256;
   var salt = crypto.randomBytes(slength).toString('base64');
   crypto.pbkdf2(answer, salt, 12000, 128, 
     function(err, hash){
     if(err) done(err);
     else{
       Challenges.create({
        cid : cid,
        answer : hash,
        ciphertext : ciphertext,
       }, function(err, challenge){
        if(err) done(err);
        else done(null, challenge);
       });
     }

   });
}




