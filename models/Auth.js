/**
 * Created by bin.shen on 6/24/16.
 */

module.exports = function (mongoose) {

    var auth = new mongoose.Schema({
        tel: { type:String, required:true },
        code: { type:String, required:true },
        created: { type:Number }
    });
    return mongoose.model('Auth', auth);
};