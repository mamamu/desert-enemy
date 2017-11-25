var Vote = require('../models/Vote.js');
var User = require('../models/User.js');
var Poll = require('../models/Poll.js');

module.exports={
  //checks both by userId and by IP returns bool
  userVotedinPoll: function(req, res, next){       
   var userId;
    if (req.user){
    userId=req.user._id;
    } else {
      userId=req.userByIP;
    };
      var promise=Vote.findOne({
         user:userId,
         poll: req.params.poll_id
       }).populate("option", "option").exec();
      promise.then(function (result){         
        if (!result){
          req.userVoted=false;          
          next();        
        } else {          
          req.userVoted=true;        
          next();
        }
    })
  },
  //no you can't delete (or share, as per my reading of the requirements) it if it's not yours!
pollReferencedWasCreatedByUser: function(req, res, next){
  var poll=req.params.id;
  var userId=req.user._id;
  Poll.findOne({_id:poll, user:userId}, function (err, record){
    if (err) {
      console.error(err);
      res.redirect('/');
    }
    else {    
    next();
    }
  })
  
}
  
}