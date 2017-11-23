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
  
  //after creating poll name, create option on create page.  this is currently a list of up to 4 but could possibly rework to be dynamic
  //this is also used when adding an additional option while logged in on the index page.  (uses same route as above)
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
  
  //get all items matching a query(searchObject) and process results using resultsArray  returns an array of objects
  getAll: function(req, res, searchmodel, searchObject, page, resultsArray, voteModel){    
    var promise=searchmodel.find(searchObject).limit(10).skip(page).sort('-created_at').exec();
    promise.then(function(items){ 
      var Arr=data.processResults(items, resultsArray);
      res.send(Arr);
    }).catch(function(err){
    console.error(err);
  });
  },
  
  //get an individual poll, search for options/votes and process results in the right format to send to chartjs
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
  
  //get the list of votes a user made and populate the pollname from the poll table then return an array of processed objects
  //can't use the process function easily because of the populate.
  userVotedFor: function(req, res, userId, searchmodel){
    var promise=searchmodel.find({user:userId}).populate("poll", "poll_name").exec();
    promise.then(function (results){      
      var Array=[];        
      results.forEach(function(result){        
        var obj={pollname:result.poll.poll_name, poll_id: result.poll._id, option: result.option }
        Array.push(obj);        
      });      
      res.send(Array);
      })    
  },
}