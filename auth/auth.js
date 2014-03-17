var localStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var crypto = require('crypto');


mongoose.connect('mongodb://localhost/whispertext');

var localUserSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String
  });

var Users = mongoose.model('userauths', localUserSchema);

exports.signup = function(username, password, done){
  
  //generate a salt of length 256
  var slength = 256;
  var salt = crypto.randomBytes(slength).toString('base64');
  var pwhash = "";
  crypto.pbkdf2(password, salt, 12000, 128, 
    function(err, nhash){
      if(err) done(err);
      else{
        Users.create({
          username : username,
          salt : salt,
          hash : nhash.toString('base64'),
        }, function(err, user){
          if(err){
            done(err);
          
          }
          done(null, user);
        });
  
      }
    });

}


exports.init = function(passport){
  
  exports.passport = passport;

  passport.use(new localStrategy(function (username, password, done){
    console.log("Trying to find user: " + username);
    Users.findOne({ username : username}, function(err, user){
      if(err) { return done(err); }
      if(!user){
        return done(null, false, {message: 'Incorrect username. ' });
      }
      crypto.pbkdf2(password, user.salt, 12000, 128, 
        function(err, hash){
          if(err) return done(err);
          if(hash.toString('base64') == user.hash){
            return done(null, user);
          }else{
          }
          done(null, false, {
            message: 'Incorrect Password'
          });
        });
    });

  }));


  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    Users.findById(id, function(err, user){
      if(err) done(err);
      done(null, user);
    });
  });

};


exports.checkAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){
    next();
  }else{
    res.redirect("/login");
  }
};

exports.doesUserExist = function(req, res, next){
  Users.count({username: req.body.username
  }, function(err, count){
    if(count === 0){
      if(req.body.password == req.body.vpassword){
        exports.signup(req.body.username, req.body.password, next);
      }else{
        res.redirect("/signup?status=pe");
      }
    } else {
      res.redirect("/signup?status=ue");
    }
  });
};
