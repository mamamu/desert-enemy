var auth=require('./mw/auth.js');
var data=require('./mw/data.js');
var datastore = require("./controller/datastore.js");
var mail = require('./controller/mail.js');

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
  scope: ['https://www.googleapis.com/auth/plus.login',
          'https://www.googleapis.com/auth/userinfo.email']
},
function(token, tokenSecret, profile, cb) {   
  //if you wanted to store email in db its in profile at (profile.emails[0].value);
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
  //if you wanted to store email in db its in profile (if user made avail) at (profile._json.email)
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
app.use(expressSession({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true, maxAge: (90 * 24 * 3600000) }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {  
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/" +process.env.VER, function (req, res) {  
  res.sendFile(__dirname+'/'+ process.env.VER);
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

app.get('/errorpage', function (req, res) {
  res.sendFile(__dirname + '/views/error.html');
});

app.get('/detail', function (req, res) {
  //this is modified by querystring
  res.sendFile(__dirname + '/views/detail.html');
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

//post this?
app.get("/delete/:id", auth.requireLogin, data.pollReferencedWasCreatedByUser, function(req, res) {  
  datastore.deletePoll(req, res, Poll);
})

app.post("/share/:id", auth.requireLogin, data.pollReferencedWasCreatedByUser, function(req, res) { 
  var sender=req.query.sender;
  var recipient=req.query.recipient;
  var pollLink="https://desert-enemy.glitch.me/detail?id="+req.params.id;    
  mail.sendMessage(sender, recipient, pollLink);
  res.send("OK");
})

//gets the polls created by a specific user for display on their profile page
app.get("/created/", auth.requireLogin, function(req, res){  
  var id=req.user._id;
  datastore.getAll(req, res, Poll, {user:id}, null, ["_id","poll_name"]);
})

//gets the voted options for the logged in user to populate voted section of profile page page
app.get("/voted/", auth.requireLogin, function(req, res){   
  var id=req.user._id;
  datastore.userVotedFor(req, res, id, Vote);
})

//get list of polls from the database and push to poll array for display on page (10 per page, page var will be multiples of 10, 0, 10, 20 etc.)
app.get("/polls/?:page", function (req, res) {   
  var page=parseInt(req.params.page);  
  datastore.getAll(req, res, Poll, {}, page, ["_id", "poll_name"], Vote);
});

//get everything in the right order and format to pass to chartjs for the display.
app.get("/polls/display/:id", function (request, response){  
  var id=request.params.id;
  datastore.getForDisplay(request, response, Poll_Option, {in_poll:id}, ["option", "_id", "in_poll"], Vote);
});

//this one assembles the clickable voting list for the individual polloptions in the display
app.get("/polls/select/:id", function (req, res){    
  var page=null;
  var id=req.params.id; 
  if (!req.user){
    datastore.getAll(req, res, Poll_Option, {in_poll:id}, page ,["_id", "option"], Vote); 
  } else {
    datastore.getAllWithUserVotes(req, res, Poll_Option, {in_poll:id}, page ,["_id", "option"], Vote); 
  }
  
});

app.get("/display/userpie", auth.requireLogin, function (req, res){
  var userid=req.user._id;  
  datastore.userCreated(req, res, userid, ["poll_name", "_id"], Poll, Vote);
})

//to allow for anon users to vote --first requireUser function checks for user and if none creates a anon/ip user in database
//checkip then gets the database userid for the ip user saved into req.userByIP, 
//to disallow multiple votes by both types uservotedinpoll checks, then saves a userVoted bool into the req
app.post('/polls/vote/:poll_id/:opt_id', auth.requireUser, auth.checkIp, data.userVotedinPoll, function(req, res){    
  if (req.userVoted==true){    
    res.send('userVoted');
  } else { 
  var userId;
  if (req.user){
    userId=req.user._id;    
  } else if (!req.user){ 
      userId=req.userByIP;      
    }; 
  datastore.upvoteOption(req, res, userId, Poll_Option, Vote);
  }
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
    res.send(false);
  }
})

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});