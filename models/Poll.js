var mongoose=require('mongoose');
var Schema = mongoose.Schema; 
var Poll_Option = require('./Poll_Option.js');
var Vote = require('./Vote.js');

var pollSchema = Schema({poll_id: Schema.Types.ObjectId,
                          poll_name:String,
                         user: {type:Schema.Types.ObjectId, ref:'User'}},{ timestamps: { createdAt: 'created_at' }  
                         
});

pollSchema.pre('remove', function(next){
  //console.log("removing dependencies");
 Poll_Option.remove({in_poll: this._id}).exec();
 Vote.remove({poll: this._id}).exec();
 next();
});

module.exports = mongoose.model("Poll", pollSchema);