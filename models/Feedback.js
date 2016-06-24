/**
 * Created by bin.shen on 6/24/16.
 */

module.exports = function (mongoose) {

    var feedback = new mongoose.Schema({
        userID: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        feedback: { type:String },
        created: { type:Number }
    });
    return mongoose.model('Feedback', feedback);
};