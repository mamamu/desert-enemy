
var mongodb=require('mongodb');
var mongoose=require('mongoose');
var Schema = mongoose.Schema; 
var Promise = require('bluebird'); 
Promise.promisifyAll(mongoose);
var url="mongodb://"+process.env.USER+":"+process.env.PASS+"@"+process.env.HOST+":"+process.env.DB_PORT+"/"+process.env.NAME;

var options={useMongoClient:true}

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var GithubStrategy = require('passport-github').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'https://'+process.env.PROJECT_DOMAIN+'.glitch.me/login/google/return',
  scope: 'https://www.googleapis.com/auth/plus.login'
},
function(token, tokenSecret, profile, cb) {
  return cb(null, profile);
}));

passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: 'https://'+process.env.PROJECT_DOMAIN+'.glitch.me/login/github/return',  
},
function(token, tokenSecret, profile, cb) {
  return cb(null, profile);
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var express = require('express');
var app = express();
var expressSession = require('express-session');


mongoose.connect(url, options);
var db=mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var optionSchema = Schema({option_id: Schema.Types.ObjectId,
                          option: String,
                          in_poll: { type: Schema.Types.ObjectId, ref: 'Poll' },
                          user:Number},  { timestamps: { createdAt: 'created_at' }});
var pollSchema = Schema({poll_id: Schema.Types.ObjectId,
                          poll_name:String,
                         user: Number},{ timestamps: { createdAt: 'created_at' }
  
                         //created_by: { type: Schema.Types.ObjectId, ref: 'User' }
});
var userSchema = Schema({user_id: Number,
                        username: String});
//newly added vote schema  also need to correct user 
var voteSchema = Schema({poll:{ type: Schema.Types.ObjectId, ref: 'Poll' },
                        option:{type: Schema.Types.ObjectId, ref: 'Option'},
                        user:Number},{ timestamps: { createdAt: 'created_at' }});

var poll_option = mongoose.model("Option", optionSchema);
var poll = mongoose.model("Poll", pollSchema);
var user = mongoose.model("User", userSchema);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');


app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({ secret:'watchfobfairies', resave: true, saveUninitialized: true, maxAge: (90 * 24 * 3600000) }));
app.use(passport.initialize());
app.use(passport.session());


app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/create", requireLogin, function (request, response) {
  response.sendFile(__dirname + '/views/create.html');
});

app.get("/login", function (request, response) {
  response.sendFile(__dirname + '/views/login.html');
});

app.get('/logoff',
  function(req, res) {
  if(req.cookies['google-passport-example']){
    res.clearCookie('google-passport-example');
    res.redirect('/');
     }
  else if (req.cookies['github-passport-example']) {
    res.clearCookie('github-passport-example');
    res.redirect('/');
  }  
    
    
  }
);
app.post("/create/new/:pollname",  
         function (req, res) {
  //console.log(req);
  var currentPoll= new poll( {poll_id: new mongoose.Types.ObjectId(),
                              poll_name:req.params.pollname,
                              user: 1
                              });
  currentPoll.save(function(err)  { 
    if (err) console.log(err);
  })
})
  

app.post("/create/name/:pollname/:option", function (req, res){   
  //console.log(req.user.id);
  var query=poll.findOne({poll_name:req.params.pollname}, function(err, poll_id){
    if (err) console.log(err);    
    var currentOption=new poll_option({
                                  option:req.params.option,
                                  in_poll:poll_id, 
                                  user:1});
    currentOption.save(function(err) {   
      if (err) console.log(err);
      console.log("save");
      
      
    });
    
  
    });  
//res.redirect('/create');
  res.sendStatus(200);
});

app.get("/polls", function (request, response) {   
  var promise=poll.find().  
  sort('-created_at').
  limit(20).
  execAsync();
  promise.then(function(polls){
    var pollArr=[];
   for (var i=0; i < polls.length; i++) {       
     var id=polls[i]._id;     
     var item={_id:polls[i]._id, poll_name: polls[i].poll_name};     
     pollArr.push(item); 
    }     
    response.send(pollArr);   
  }).catch(function(err){
    console.error(err);
  })  
});

app.get("/polls/select/:id", function (request, response){ 
  var id=request.params.id
  console.log(id);
  poll_option.find({in_poll:id}, function(err, options){
    if (err) console.log(err);     
    var opts=[];
         for (var j=0; j<options.length; j++){ 
           console.log(options[j].user);
           opts.push({_id:options[j]._id, option:options[j].option});                      
         }
    response.send(opts);
  }); 
 
});


/*
// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) { 
  var currentDream= new dream( {dream:request.query.dream, upvotes:0, user:1} );
  currentDream.saveAsync().then(currentDream=>  {          
      console.log('saving');    
    });  
  err=> {console.err(err)} 
  response.sendStatus(200);
});
*/
app.get('/auth/google', passport.authenticate('google'));

app.get('/login/google/return', 
  passport.authenticate('google', 
    { successRedirect: '/setcookie', failureRedirect: '/' }
  )
);

app.get('/auth/github', passport.authenticate('github'));


app.get('/login/github/return', 
  passport.authenticate('github', 
    { successRedirect: '/setcookie', failureRedirect: '/' }                      
  )
       
);

// on successful auth, a cookie is set before redirecting
// to the success view
app.get('/setcookie', requireUser,
  function(req, res) {
  //console.log(req.get('Referrer'));
    if(req.get('Referrer') && req.get('Referrer').indexOf("google")!=-1){
      res.cookie('google-passport-example', new Date());
      res.redirect('/create');
    } else if(req.get('Referrer') && req.get('Referrer').indexOf("github")!=-1){
      res.cookie('github-passport-example', new Date());
      res.redirect('/create');
    }
  //what if you're already logged in from somewhere else?  
  //need the below because referrer check doesn't work
  else if (req.user.id && req.user.provider == "google"){
    //console.log(req.user);
      res.cookie('google-passport-example', new Date());
      res.redirect('/create');
    }else if (req.user.id && req.user.provider == "github"){
      console.log(req.user.username);
      res.cookie('github-passport-example', new Date());
      res.redirect('/create');
    }
  else{      
       res.redirect('/');
    }
  }
);
/*
app.get('/authRoute', requireLogin, function(req, res){
  console.log("authRoute");
  console.log(req);
  if (req.user.github.id){
				res.json(req.user.github);	
			}
			else if (req.user.google.id){
				res.json(req.user.google);
			}
})
*/
// if cookie exists, success (different routes for each cookie too!). otherwise, user is redirected to index
/*app.get('/success', requireLogin,
  function(req, res) {
    if(req.cookies['google-passport-example']) {
      res.sendFile(__dirname + '/views/success.html');
    } 
    else if  (req.cookies['github-passport-example']) {
      res.sendFile(__dirname + '/views/success2.html');
    } 
    else{
      res.redirect('/');
    }
  }
);
*/

function requireLogin(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/login');
  }
}
/*
function requireLogin (req, res, next) {
  if (!req.cookies['google-passport-example']){
    console.log("not google")
    if (!req.cookies['github-passport-example']) {
      console.log("not github")
      res.redirect('/');
    } 
    else {
      next();
    }
  }else {
    next();
  }
};
*/

function requireUser (req, res, next) {
  if (!req.user) {    
    res.redirect('/');
  } else { 
    console.log(req.user)
    next();
  }
};


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
