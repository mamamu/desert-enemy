var auth=require('./mw/auth.js');
var data=require('./mw/data.js');
var datastore = require("./controller/datastore.js");

var Chart = require('chart.js');

var mongoose=require('mongoose');
var Poll = require('./models/Poll.js');
var Poll_Option = require('./models/Poll_Option.js');
var User = require('./models/User.js');
var Vote = require('./models/Vote.js');

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
  process.nextTick(function () {
    User.findOne({ 'profile_id': profile.id }, function(err, user){
      if (err){
        return cb(err);
      }
      if (user) {
        return cb(null, user);
      } else {
        var newUser = new User();
          newUser.user_id = new mongoose.Types.ObjectId(),
        	newUser.profile_id = profile.id;
					newUser.username = profile.displayName;
					newUser.provider = profile.provider;					

					newUser.save(function (err) {
						if (err) {
							throw err;
						}
            return cb(null, newUser);        
      });
    }
  });   
});
}));

passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: 'https://'+process.env.PROJECT_DOMAIN+'.glitch.me/login/github/return',  
},
function(token, tokenSecret, profile, cb) {  
  process.nextTick(function () {
    User.findOne({ 'profile_id': profile.id }, function(err, user){
      if (err){
        return cb(err);
      }
      if (user) {
        return cb(null, user);
      } else {
        var newUser = new User();
          newUser.user_id = new mongoose.Types.ObjectId(),
        	newUser.profile_id = profile.id;
					newUser.username = profile.username;
					newUser.provider = profile.provider;
					
					newUser.save(function (err) {
						if (err) {
							throw err;
						}
            return cb(null, newUser);        
      });
    }
  });  
});
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


var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');


app.use(express.static('public'));
app.use(express.static('controller'));


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({ secret:'watchfobfairies', resave: true, saveUninitialized: true, maxAge: (90 * 24 * 3600000) }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {   
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/create", auth.requireLogin, function (req, res) {
  res.sendFile(__dirname + '/views/create.html');
});

app.get("/profile", auth.requireLogin, function (req, res) {
  res.sendFile(__dirname + '/views/profile.html');
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/logoff', function(req, res) {  
  req.logOut();   
  res.redirect('/');     
  }
);

//this creates the new poll name
app.post("/create/new/:pollname", auth.requireLogin, function (req, res) {  
  datastore.createPoll(req, res, Poll);   
})
  
//this adds options to a created poll name
app.post("/create/id/:pollId/:option", auth.requireLogin, function (req, res){   
  datastore.createOption(req, res, Poll_Option, Poll);
});

app.get("/created/", auth.requireLogin, function(req, res){
  //console.log(req.user);
  var id=req.user._id;
  datastore.getAll(req, res, Poll, {user:id}, ["_id","poll_name"]);
})

app.get("/voted/", auth.requireLogin, function(req, res){  
  var id=req.user._id;
  datastore.userVotedFor(req, res, id, Vote);
})

//get list of polls from the database and push to poll array for display on page /currently limited to 20 most recent
app.get("/polls", function (req, res) {   
  datastore.getAll(req, res, Poll, {}, ["_id", "poll_name"]);
});

//get everything in the right order and format to pass to chartjs for the display.
//need to make sure this doesn't load from the cache

app.get("/polls/display/:id", function (request, response){  
  var id=request.params.id;
  datastore.getForDisplay(request, response, Poll_Option, {in_poll:id}, ["option", "_id"], Vote);
});

app.get("/polls/select/:id", function (req, res){ 
  //this one assembles the clickable voting list for the individual polloptions in the display 
  var id=req.params.id;   
  datastore.getAll(req, res, Poll_Option, {in_poll:id}, ["_id", "option"]); 
});

//need to check if user/ip has voted  
app.post('/polls/vote/:opt_id', auth.requireUser, function(req, res){  
  //to allow for anon users to vote --requireUser function checks for user and if none creates a anon/ip user in database
  //below var assigns either the req.user._id, or looks up the user by ip in the database
 
  var userId;
  if (req.user){
    userId=req.user._id;
    datastore.upvoteOption(req, res, userId, Poll_Option, Vote);
  }
    else if (!req.user){
      var profileId=auth.getProfilebyIp(req); 
      var promise=User.findOne({profile_id:profileId}, function (err, user){      
        if (err) console.error(err);
      })
      promise.then(function (user){
        userId=user._id;        
      datastore.upvoteOption(req, res, userId, Poll_Option, Vote);
    })
    }; 

})



//auth routes for passport
app.get('/auth/google', passport.authenticate('google'));

app.get('/login/google/return', 
  passport.authenticate('google', 
    { successRedirect: '/', failureRedirect: '/login' }
  )
);

app.get('/auth/github', passport.authenticate('github'));

app.get('/login/github/return', 
  passport.authenticate('github', 
    { successRedirect: '/', failureRedirect: '/login' }                      
  )       
);

//usercontroller checks this to get user info
app.get('/authRoute', auth.requireLogin, function(req, res){   
  if (req.user._id){
				res.json(req.user);
			}
  else {    
    res.send(false)
  }
})

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});