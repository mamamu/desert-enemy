var mongoose=require('mongoose');
var User = require('../models/User.js');

module.exports={
  
  requireUser: function(req, res, next) {
  if (!req.user) {  
    ///create IP user here and add to database    
    var head=req.headers['x-forwarded-for']  
    var newUserIp;     
    newUserIp=head.slice(0,11);
    var profileId=newUserIp.replace(/\./g, "");
    
    User.findOne({profile_id:profileId}, function (err, user){      
      if (!user){
        var newUser = new User();
          newUser.user_id = new mongoose.Types.ObjectId(),
        	newUser.profile_id = profileId;
					newUser.username = 'Anon_User';
					newUser.provider = 'IP';
					
					newUser.save(function (err, user) {
						if (err) console.error(err); 						
            console.log(user._id);
            next();
          }); 
      }
        else {
          next();
        }
      
    })
  } else {     
    next();
  }
  },

  
  requireLogin:function(req, res, next){
  if (req.isAuthenticated()){     
    return next();
  }
  else{         
    res.redirect('/login');    
  }
},
  

  //this checks ip, checks database, and saves the ip user's user_id in the req 
  //used for voting for ip user only
  checkIp:function(req, res, next){    
    var user_Id;
    if (!req.user){    
    var head=req.headers['x-forwarded-for'] ; 
    var newUserIp;     
    newUserIp=head.slice(0,11);
    var profileId=newUserIp.replace(/\./g, "");
    var promise=User.findOne({profile_id:profileId}).exec();
    promise.then(function(user){      
        req.userByIP=user._id; 
        next();
      });  
  } 
    else if (req.user){      
      next();
    }
    
  },
}
