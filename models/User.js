var mongoose=require('mongoose');
var Schema = mongoose.Schema; 

var userSchema = Schema({user_id: Schema.Types.ObjectId,
                         profile_id: Number,
                        username: String,
                        provider: String});

module.exports = mongoose.model("User", userSchema);