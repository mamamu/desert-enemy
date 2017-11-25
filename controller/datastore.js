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
var auth=require('../mw/auth.js')


module.exports = {
  
  //create poll name on create page 
  //I can see use cases where one friend might create a pollname and others fill in the options so I'm allowing name creation w/o options 
  //this could be altered to disallow/roll back if other use case is required
  createPoll: function(req, res, savemodel){
    var currentItem= new savemodel( {poll_id: new mongoose.Types.ObjectId(),
                              poll_name:req.params.pollname,
                              user:req.user._id
                              });
  currentItem.save(function(err, obj) {     
    if (err) console.error(err);    
    res.status(200).send(obj);
  })  
  }, 
  
  //after creating poll name, create options on create page.  
  //this is also used when adding an additional option while logged in on the index page.  
  createOption: function(req, res, savemodel, searchmodel){   
    var currentOption=new savemodel({
                                  option:req.params.option,
                                  in_poll:req.params.pollId, 
                                  user:req.user._id});
    currentOption.save(function(err) {   
      if (err) console.error(err);
      //console.log("save"); 
      });       
  res.sendStatus(200);   
  },
  
  //delete poll (model pre should handle deletion cascade of all related options and votes)
  deletePoll: function(req, res, searchmodel){     
    searchmodel.findOne({_id: req.params.id}, function(err, poll){
      if (err) console.error(err);      
      poll.remove();
    }) 
    res.sendStatus(200); 
  },
  
  //get all polls and get all options for a user that is not logged in
  getAll: function(req, res, searchmodel, searchObject, page, resultsArray, voteModel){ 
    var fields=resultsArray.join(" "); 
    var Promise=searchmodel.find(searchObject).limit(10).skip(page).sort('-created_at').select(fields).exec();
    Promise.then(function(items){ 
    res.send(items)});
  },
  
  //get all options for a logged in user including details on if/how that user voted
  getAllWithUserVotes: function(req, res, searchmodel, searchObject, page, resultsArray, voteModel){ 
    var fields=resultsArray.join(" "); 
    var Promise=searchmodel.find(searchObject).limit(10).skip(page).sort('-created_at').select(fields).exec();
    Promise.then(function(items){        
      var Arr=[];      
      items.forEach(function(item){         
        item.votedFor=false;          
        var Promise=voteModel.findOne({option:item._id, user: req.user._id}).exec();
          Promise.then(function(vt){
            if (vt!==null){
              item.votedFor=true;
            }
            Arr.push({_id:item._id, option:item.option, voted:item.votedFor});   
            if (Arr.length===items.length){            
              res.send(Arr);
            }
          })          
      }) 
    }).catch(function(err){
    console.error(err);
  });
  },
  
  //get an individual poll, search for options/votes and process results in the right format to send to chartjs
  getForDisplay: function(req, res, searchmodel, searchObject, resultsArray, submodel){ 
    var fields=resultsArray.join(" ");     
    var Promise=searchmodel.find(searchObject).select(fields).populate({path:"in_poll", select:"poll_name"}).exec();  
    Promise.then(function (options){ 
      var votes=[];
      var labels=[];        
      var pollname=options[0].in_poll.poll_name;       
      options.forEach(function(opt){
      var Promise=submodel.count({option:opt._id}).exec();
      Promise.then(function (ct){ 
        votes.push(ct);
        labels.push(opt.option);        
        if (labels.length===options.length){          
          var ret={}; 
          ret.votes=votes;
          ret.labels=labels;         
          ret.poll_name=pollname;          
          res.send(ret); 
        }        
      })      
    })
  }).catch(function(err){
        console.error(err);
      });
  },
  
  //does exactly what you'd expect ;)
  upvoteOption: function(req, res, userId, searchmodel, savemodel){
    searchmodel.findOne({_id:req.params.opt_id}, function(err, option){        
    if (err) console.error(err);       
    var current=option.in_poll;      
    var newVote = new savemodel ({  
        poll: current,
        option: req.params.opt_id,
        user: userId,
  })     
    newVote.save(function(err){
      if(err)console.error(err);
      res.sendStatus(200);
    })     
  })     
  },
  //specific for creating pie chart of all user created polls with total votes on each
  userCreated: function(req, res, userid, resultsArray, searchmodel, submodel){ 
    var fields=resultsArray.join(" ");    
    var Promise=searchmodel.find({user:userid}).select(fields).exec();
    Promise.then(function(polls){
      var pielabels=[];
      var pievotes=[];      
      polls.forEach(function(poll){       
      var Promise=submodel.count({poll:poll._id}).exec();
      Promise.then(function (count){        
        pievotes.push(count);
        pielabels.push(poll.poll_name);
        poll.count=count; 
        if (pielabels.length===polls.length){
          var ret={}; 
          ret.votes=pievotes;
          ret.labels=pielabels; 
          res.send(ret); 
        }
      })      
    })
  }).catch(function(err){
        console.error(err);
      });
  },
  
  //get the list of votes a user made and populate the pollname from the poll table 
  userVotedFor: function(req, res, userId, searchmodel){
    var fields="poll option"
    var Promise=searchmodel.find({user:userId}).populate("poll", "poll_name").select(fields).exec();
    Promise.then(function (results){       
      res.send(results);
      })    
  },
}