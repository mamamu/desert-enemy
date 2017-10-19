var mongoose=require('mongoose');
var User = require('../models/User.js');

module.exports={
  
  requireUser: function(req, res, next) {
  if (!req.user) {  
    ///create user here and add to database
    //console.log(req.headers['x-forwarded-for']);
    var head=req.headers['x-forwarded-for']  
    var newUserIp; 
    //console.log(head);
    newUserIp=head.slice(0,11);
    var profileId=newUserIp.replace(/\./g, "");
    
    User.findOne({profile_id:profileId}, function (err, user){
      //console.log(user)
      if (!user){
        var newUser = new User();
          newUser.user_id = new mongoose.Types.ObjectId(),
        	newUser.profile_id = profileId;
					newUser.username = 'Anon_User';
					newUser.provider = 'IP';
					//console.log(newUser);

					newUser.save(function (err) {
						if (err) {
							console.log(err); 
						}
            console.log("Ip save");
            next();
          }); 
      }
        else {
          next();
        }
      
    })
  } else { 
    console.log("not !user")
    next();
  }
  },
  
  requireLogin:function(req, res, next){
  if (req.isAuthenticated()){ 
    console.log("auth in reqLog")
    return next();
  }
  else{
    console.log("No user");    
    res.redirect('/login');
  }
},
  //this was working but broke and ive moved it back into server.
  checkIp:function(req, res){    
    var user_Id;
    if (!req.user){    
    var head=req.headers['x-forwarded-for'] ; 
    var newUserIp;     
    newUserIp=head.slice(0,11);
    var profileId=newUserIp.replace(/\./g, "");
    var promise=User.findOne({profile_id:profileId}).exec();
    promise.then(function(user){
        user_Id=user._id; 
        return user_Id;
      });  
  } else {
    user_Id=req.user._id; 
  }
    
  
   
  }
};