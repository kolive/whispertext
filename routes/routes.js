var url = require('url');
var Users = require('../models/user');
var Profiles = require('../models/profile');
var Challenges = require('../models/challenge');
var Hints = require('../models/hint');

exports.route = function(app, passport, auth){
  
  app.get('/', function(req, res){
    if(req.isAuthenticated()){
      res.render('index', { title: 'Whispertext: Secrets, whispers, and numbers.', user: req.user.username });
    }else{
      res.render('index', { title: 'Whispertext: Secrets, whispers, and numbers.'});
    }
  });

  app.get('/login', function(req,res){
    if(req.isAuthenticated()){
      res.redirect('/profile'); 
    }
    var query = url.parse(req.url, true).query;
    var msg = '';
    if(query['status'] == 'failed'){
      msg = "Username or password failed. Please try again.";
    }
    res.render('login', { title: 'Login!', msg: msg });
  });

  app.post('/login', auth.passport.authenticate('local', {
        successRedirect:"/profile",
        failureRedirect:"/login?status=failed" })
  );

  app.get('/signup', function(req, res){
    var query = url.parse(req.url, true).query;
    var msg = '';
    var uclass = '';
    var pclass = '';
    if(query['status'] == 'ue'){
      msg = 'Invalid or duplicate username, please use something else.';
      uclass= 'red-border';
    }else if(query['status'] == 'pe'){
      msg = 'Nonmatching or invalid passwords, please try again.';
      pclass = 'red-border';
    }
    res.render('signup', { title: 'Sign up for Whispertext', msg: msg, uclass: uclass, pclass: pclass });
  });

  app.post('/signup', auth.doesUserExist, function(req, res){
      res.redirect('/login#please-login');
    });

  app.get('/profile', function(req, res){
    var title = "User Profile Page";
    var query = url.parse(req.url, true).query;
    if(query['username'] !== undefined && query['username'].length > 0){
      Users.getUser(query['username'], function(err, user){
        if(user === null || err) res.render('profile', { title: "Missing Profile Page"});
        else{ 
          Profiles.getProfile(query['username'], function(err, profile){
              if(profile===null || err) res.render('profile', {title: "Missing Profile Page"});
              else res.render('profile', { title: user.username + "'s Profile", user: user, profile: profile });
            });
         }
        });
    }else if(query['username'] === undefined && req.isAuthenticated()){
      res.redirect('/profile?username='+req.user.username);
    }else{
      res.render('profile', { title: "Hey, you're not logged in." });
    }

  });

  app.get('/challenge', function(req, res){
    var query = url.parse(req.url, true).query;
    if(query['id'] === undefined) 
      res.status(404).render('errors/404', {title: 'Challenge not found'});


    Challenges.getChallenge(query['id'], function(err, challenge){
      if(err || challenge === null) res.status(404).render('errors/404', {title: 'Error'});
      Hints.getHintsForChallenge(query['id'], function(err, hints){
        //TODO: get hintcount and pass to renderer, hintcount=-1 if not logged in
        var hintcount = -1;
        if(req.isAuthenticated()){
          hintcount = 1;
        }
        //hitcountget should create an empty challengestate if one isn't created
        res.render('challenges/challenge', {title: 'Challenge ' + query['id'], challenge: challenge, hints: hints, hintcount : hintcount});
      });
    });

  });

  app.get('/admin/challenge', function(req, res){
    if(req.isAuthenticated() && req.user.username === 'admin'){
      res.render('admin/challenge', {title: 'New Challenge Form' });
    }else{
      res.status(404).render('errors/404', {title:'Not logged in as admin'});
    }

  });
  
  app.get('/admin/hint', function(req, res){
    if(req.isAuthenticated() && req.user.username === 'admin'){
      res.render('admin/hint', {title: 'New Hint Form' });
    }else{
      res.status(404).render('errors/404', {title:'Not logged in as admin'});
    }

  });

  app.post('/admin/nch', function(req,res){
    if(req.isAuthenticated() && req.user.username === 'admin'){
      Challenges.newChallenge(req.body.cid, req.body.answer, req.body.ciphertext, function(err, challenge){
        res.redirect('/challenge?id='+req.body.cid);
      });
    }else{
      res.status(404).render('errors/404', {title:'Not logged in as admin'});
    }

  });
  
  app.post('/admin/nh', function(req,res){
    if(req.isAuthenticated() && req.user.username === 'admin'){
      Hints.newHint(req.body.cid, req.body.seq_num, req.body.delay, req.body.content, function(err, hint){
        res.redirect('/challenge?id='+req.body.cid);
      });
    }else{
      res.status(404).render('errors/404', {title:'Not logged in as admin'});
    }

  });
 


};
