/**
 * Created by bin.shen on 7/9/16.
 */

module.exports = function (mongoose) {

    var deviceTest = new mongoose.Schema({
        mac: { type:String, required:true },
        test: { type:Number },
        created: { type:Number }
    }, {
        collection: 'device_tests',
        id: false
    });
    return mongoose.model('DeviceTest', deviceTest);
};