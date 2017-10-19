var mongoose=require('mongoose');
var Schema = mongoose.Schema; 

var voteSchema = Schema({
                        poll: {type: Schema.Types.ObjectId, ref: 'Poll'},
                        option:{type: Schema.Types.ObjectId, ref: 'Option'},
                        user:{type: Schema.Types.ObjectId, ref:'User'},},{ timestamps: { createdAt: 'created_at' }});

module.exports = mongoose.model("Vote", voteSchema);