/**
 * Created by bin.shen on 6/19/16.
 */

module.exports = function (mongoose) {

    var user = new mongoose.Schema({
        username: { type:String, required:true },
        password: { type:String, required:true },
        nickname: { type:String }
    });
    return mongoose.model('User', user);
};