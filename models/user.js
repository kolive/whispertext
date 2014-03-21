
var mongoose = require('mongoose');

exports.localUserSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    salt: String,
    hash: String
  });

var Users = mongoose.model('userauths', exports.localUserSchema);
exports.getUser = function(username, done){
  Users.findOne({ username : username }, done);
}

