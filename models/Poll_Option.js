var mongoose=require('mongoose');
var Schema = mongoose.Schema; 

var optionSchema = Schema({option_id: Schema.Types.ObjectId,
                          option: String,
                          in_poll: { type: Schema.Types.ObjectId, ref: 'Poll' },
                          user:{type:Schema.Types.ObjectId, ref:'User'}},  { timestamps: { createdAt: 'created_at' }});

module.exports = mongoose.model("Option", optionSchema);