/**
 * Created by bin.shen on 6/22/16.
 */

module.exports = function (mongoose) {

    var data = new mongoose.Schema({
        mac:  { type:String, required:true },
        x01:  { type:Number },
        x01:  { type:Number },
        x02:  { type:Number },
        x03:  { type:Number },
        x04:  { type:Number },
        x05:  { type:String },
        x06:  { type:String },
        x07:  { type:String },
        x08:  { type:String },
        x09:  { type:Number },
        x10:  { type:Number },
        x11:  { type:Number },
        x12:  { type:Number },
        x13:  { type:Number },
        x14:  { type:Number },
        date: { type:Date }
    });
    return mongoose.model('Data', data);
};