var localStrategy = require('passport-local').Strategy;

exports.init = function(passport, mongoose){
  
  var localUserSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String
  });

  var Users = mongoose.model('userauths', localUserSchema);

  passport.use(new localStrategy(function (username, password, done){
    Users.findOne({ username : username}, function(err, user){
      if(err) { return done(err); }
      if(!user){
        return done(null, false, {message: 'Incorrect username. ' });
      }

      hash( password, user.salt, function(err, hash){
        if(err) { return done(err); }
        if (hash == user.hash) return done(null, user);
        done(null, false, {message: 'Incorrect password.' });
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
      next();
    } else {
      res.redirect("/signup");
    }
  });
};
