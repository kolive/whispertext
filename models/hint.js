var mongoose = require('mongoose');


exports.hintSchema = new mongoose.Schema({
  cid: Number,
  seq_num: Number,
  delay: Number, 
  content: String
});

var Hints = mongoose.model('hints', exports.hintSchema);

exports.getHint = function(cid, seq_num, done){

  Hints.findOne({cid : cid, seq_num:seq_num}, done);

}

exports.getHintsForChallenge = function(cid, done){
  console.log(cid);
  Hints.find({cid:cid}, function(err, hints){
    console.log(hints);
    done(err,hints);
  });
}

exports.newHint = function(cid, seq_num, delay, content, done){

  Hints.create({
    cid: cid,
    seq_num: seq_num,
    delay: delay,
    content: content
    }, done);


}
