
var mongodb=require('mongodb');
var mongoose=require('mongoose');
var Schema = mongoose.Schema; 
var Promise = require('bluebird'); 
Promise.promisifyAll(mongoose);
var url="mongodb://"+process.env.USER+":"+process.env.PASS+"@"+process.env.HOST+":"+process.env.DB_PORT+"/"+process.env.NAME;

var options={useMongoClient:true}

mongoose.connect(url, options);
var db=mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var optionSchema = Schema({option_id: Schema.Types.ObjectId,
                          option: String,
                          in_poll: { type: Schema.Types.ObjectId, ref: 'Poll' },
                          user:{type:Schema.Types.ObjectId, ref:'User'}},  { timestamps: { createdAt: 'created_at' }});
var pollSchema = Schema({poll_id: Schema.Types.ObjectId,
                          poll_name:String,
                         user: {type:Schema.Types.ObjectId, ref:'User'}},{ timestamps: { createdAt: 'created_at' }  
                         
});
var userSchema = Schema({user_id: Schema.Types.ObjectId,
                         profile_id: Number,
                        username: String,
                        provider: String});

var voteSchema = Schema({
                        poll: {type: Schema.Types.ObjectId, ref: 'Poll'},
                        option:{type: Schema.Types.ObjectId, ref: 'Option'},
                        user:{type: Schema.Types.ObjectId, ref:'User'},},{ timestamps: { createdAt: 'created_at' }});

var Poll_Option = mongoose.model("Option", optionSchema);
var Poll = mongoose.model("Poll", pollSchema);
var User = mongoose.model("User", userSchema);
var Vote = mongoose.model("Vote", voteSchema);

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
  //console.log(profile);
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
  //return cb(null, profile);
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
  //return cb(null, profile);
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

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({ secret:'watchfobfairies', resave: true, saveUninitialized: true, maxAge: (90 * 24 * 3600000) }));
app.use(passport.initialize());
app.use(passport.session());


app.get("/", function (req, res) {   
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/create", requireLogin, function (req, res) {
  res.sendFile(__dirname + '/views/create.html');
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/logoff',
  function(req, res) {  
  req.logOut();   
  res.redirect('/'); 
    
  }
);

//this creates the new poll name
app.post("/create/new/:pollname",  
         function (req, res) {  
  var currentPoll= new Poll( {poll_id: new mongoose.Types.ObjectId(),
                              poll_name:req.params.pollname,
                              user :req.user._id
                              });
  currentPoll.save(function(err) { 
    if (err) console.err(err);
  })  
})
  
//this adds options to a created poll name
app.post("/create/name/:pollname/:option", function (req, res){     
  var query=Poll.findOne({poll_name:req.params.pollname}, function(err, poll_id){
    if (err) console.err(err);    
    var currentOption=new Poll_Option({
                                  option:req.params.option,
                                  in_poll:poll_id, 
                                  user:req.user._id});
    currentOption.save(function(err) {   
      if (err) console.log(err);
      console.log("save"); 
      });
    });    
  res.sendStatus(200);
});

app.get("/polls", function (request, response) {   
  var promise=Poll.find().  
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

app.get("/polls/display/:id", function (request, response){   
  var id=request.params.id;  
  var optObjArray=[];  
  //get the list of poll options by poll id from the options collection loop through and get name and id and add these to obj
  var Promise=Poll_Option.find({in_poll:id}).populate({path:"in_poll", select:"poll_name"}).exec();  
  Promise.then(function (options){ 
    var pollname=options[0].in_poll.poll_name;
    options.forEach(function(opt){
      var obj={};
      obj.option=opt.option;
      var oid=opt._id;
      obj.id=opt._id;   
      //get the count of votes from the vote table using the option id then add these to obj
      var Promise=Vote.count({option:oid}).exec();
      Promise.then(function (ct){
        obj.ct=ct    
        //when obj complete push to votesArray, then process optObjArray to get separate labels and votes arrays in the correct order
        optObjArray.push(obj);     
        var ret={};
        var labels=[];
        var votes=[];        
        optObjArray.forEach(function(item){        
          labels.push(item.option);
          votes.push(item.ct);        
        });   
        ret.votes=votes;
        ret.labels=labels;
        if (labels.length<options.length){
          console.log(labels.length);
        }else {  
          ret.poll_name=pollname
          response.send(ret);
        }
      }).catch(function(err){
            console.error(err);
          });
    });    
  }).catch(function(err){
        console.error(err);
      });
});

app.get("/polls/select/:id", function (request, response){   
  var id=request.params.id;   
  Poll_Option.find({in_poll:id}, function(err, options){
    if (err) console.err(err); 
    var opts=[];
    for (var j=0; j<options.length; j++){ 
      opts.push({_id:options[j]._id, option:options[j].option}); 
    }    
    response.send(opts);    
  });  
});

//vote for an option  need to change so it doesn't require login, but collects ip for anon votes.
//also need to check if user/ip has voted  
app.post('/polls/vote/:opt_id', function(req, res){  
  
  //if user then user = req. user id  else user = headers/xfowd trim at ,
  //dont need a require user function, but could use check if voted in same place.
  Poll_Option.findOne({_id:req.params.opt_id}, function(err, option){
    
    if (err) console.err(err);    
    var current=option.in_poll;    
    var newVote = new Vote ({  
        poll: current,
        option: req.params.opt_id,
        user: req.user._id,
  })
    
    newVote.save(function(err){
      if(err)console.log(err);
      console.log("voting");
    })
    
  })
  
  
  
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

app.get('/authRoute', requireLogin, function(req, res){  
  //check that this rejects ip only voters
  console.log("hi i see you're using  "+req.user.provider);
  if (req.user._id){
				res.json(req.user);
			}
  else {    
    res.redirect('/login')
  }
})


function requireLogin(req, res, next){
  if (req.isAuthenticated()){    
    return next();
  }
  else{
    console.log("No user");
    //console.log(req);
    res.redirect('/login');
  }
}


function requireUser (req, res, next) {
  if (!req.user) {  
    ///create user here and add to database
    //console.log(req.headers['x-forwarded-for']);
    var head=req.headers['x-forwarded-for']  
    var newUserIp; 
    newUserIp=head.slice(0,11);
  
    //need to create a new user in the database for ip only users or validation fails due to key refs.
    //console.log(user);
  
  } else { 
    //console.log(req.user.provider)
    next();
  }
};


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
