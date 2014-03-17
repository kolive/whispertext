/* GET home page. */
exports.route = function(app, auth){
  
  app.get('/', function(req, res){
    res.render('index', { title: 'Whispertext: Secrets, whispers, and numbers.' });
  });

  console.log("test");
};
