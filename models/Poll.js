var mongoose=require('mongoose');
var Schema = mongoose.Schema; 

var pollSchema = Schema({poll_id: Schema.Types.ObjectId,
                          poll_name:String,
                         user: {type:Schema.Types.ObjectId, ref:'User'}},{ timestamps: { createdAt: 'created_at' }  
                         
});

module.exports = mongoose.model("Poll", pollSchema);