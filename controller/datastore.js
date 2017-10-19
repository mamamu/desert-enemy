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

var data=require('../mw/data.js');

//don't need these on the page if I pass them in and write a bit more abstractly
//var Poll = require('../models/Poll.js');
//var Poll_Option = require('../models/Poll_Option.js');
//var User = require('../models/User.js');
//var Vote = require('../models/Vote.js');

//function userVotedFor(userId, optionArray){
  //get the user id or ip  
    
  // console.log(userId);
   
   
  //find all votes for that user
  /*
    var promise=Vote.find({user:userId}).exec();
    promise.then(function (results){
        console.log(results)
      }
      
    )*/
 // }


module.exports = {
  createPoll: function(req, res, savemodel){
    var currentItem= new savemodel( {poll_id: new mongoose.Types.ObjectId(),
                              poll_name:req.params.pollname,
                              user:req.user._id
                              });
  currentItem.save(function(err) { 
    if (err) console.error(err);
    res.send(200);
  })  
  },  
  createOption: function(req, res, savemodel, searchmodel){
    var query=searchmodel.findOne({poll_name:req.params.pollname}, function(err, poll_id){
    if (err) console.error(err);    
    var currentOption=new savemodel({
                                  option:req.params.option,
                                  in_poll:poll_id, 
                                  user:req.user._id});
    currentOption.save(function(err) {   
      if (err) console.error(err);
      console.log("save"); 
      });
    });    
  res.sendStatus(200);   
  },
  getAll: function(req, res, searchmodel, searchObject, resultsArray){
    var promise=searchmodel.find(searchObject).sort('-created_at').exec();
    promise.then(function(items){
      var Arr=data.processResults(items, resultsArray);
      res.send(Arr);
    }).catch(function(err){
    console.error(err);
  });
  },
  getForDisplay: function(req, res, searchmodel, searchObject, resultsArray, submodel){        
  var optObjArray=[]; 
  var Promise=searchmodel.find(searchObject).populate({path:"in_poll", select:"poll_name"}).exec();  
  Promise.then(function (options){ 
    var pollname=options[0].in_poll.poll_name;    
    var optionArr=data.processResults(options, resultsArray);  
    optionArr.forEach(function(opt){      
      var Promise=submodel.count({option:opt._id}).exec();
      Promise.then(function (ct){
        opt.ct=ct         
        optObjArray.push(opt);
        if (optObjArray.length===optionArr.length){
          var ret={};         
          var labels=data.generateDisplayArrays(optObjArray, 'option');
          var votes=data.generateDisplayArrays(optObjArray, 'ct');         
          ret.votes=votes;
          ret.labels=labels;         
          ret.poll_name=pollname          
          res.send(ret); 
        }
      })      
    })
  }).catch(function(err){
        console.error(err);
      });
  },
  upvoteOption: function(req, res, userId, searchmodel, savemodel){    
    searchmodel.findOne({_id:req.params.opt_id}, function(err, option){  
      
    if (err) console.err(err);    
    var current=option.in_poll;    
    var newVote = new savemodel ({  
        poll: current,
        option: req.params.opt_id,
        user: userId,
  })   
    
    newVote.save(function(err){
      if(err)console.log(err);
      console.log("voting");
    })    
  }) 
  },
  
  

  
}