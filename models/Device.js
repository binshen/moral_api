/**
 * Created by bin.shen on 6/20/16.
 */

module.exports = function (mongoose) {

    var device = new mongoose.Schema({
        mac: { type:String, required:true },
        name: { type:String },
        userID: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' }
    });
    return mongoose.model('Device', device);
};