var localStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var usermodel = require('../models/user').localUserSchema;
var userprofile = require('../models/profile').userProfile;
var mongoose = require('mongoose');
var Users = mongoose.model('userauths', usermodel);
var UserProfiles = mongoose.model('userprofile', userprofile);


/***
 *
 * Registers a user in the database. Users have a username and password associated with them.
 * The password is salted and stored as a hash. 
 *
 *
 ***/
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
          UserProfiles.create({
            username : username,
            created: Date.now(),
            points: 0,
            achievement_ids: [],
            }, function(err, profile){
                if(err){
                  done(err);
                }
              });
          done(null, user);
        });
  
      }
    });

}


/***
 *
 * Inits the auth and defines strategies for authentication
 *
 ***/
exports.init = function(passport){
  
  exports.passport = passport;
  passport.use(new localStrategy(function (username, password, done){
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
    res.redirect("/login?status=failed");
  }
};

/***
 *
 *  Perhaps more aptly named "create user if none exists"
 *
 *  Handles verification of username and password and creates user
 *
 ***/
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
