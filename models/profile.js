
var mongoose = require('mongoose');

exports.userProfile = new mongoose.Schema({
    username: String,
    created: Date,
    points: Number,
    achievement_ids: [Number]
  });

var UserProfiles = mongoose.model('userprofile', exports.userProfile);
exports.getProfile = function(username, done){
  UserProfiles.findOne({ username : username }, done);
}
