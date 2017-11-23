var Vote = require('../models/Vote.js');
var User = require('../models/User.js');
var Poll = require('../models/Poll.js');

module.exports={
//process an array of objects to create an array of selected fields
  //this is used in datastore.js to process results from the database 
  //before sending to the view so we don't include fields we don't want to.
  processResults:function(results, fieldArray){
    var Array=[];    
    results.forEach(function(result){ 
      var obj={};
       for (var i=0; i<fieldArray.length; i++){          
         obj[fieldArray[i]]=result[fieldArray[i]];
       }      
      Array.push(obj);
    })
    return Array;
  },
  //pull out a single field from an array of objects and push to an individual return array
  //this is used for generating the arrays that become datasets for chartjs
  generateDisplayArrays:function(objArray, fieldName){
    var Array=[];
    objArray.forEach(function(item){      
        Array.push(item[fieldName]) ;  
  })
    return Array;
  },
  
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