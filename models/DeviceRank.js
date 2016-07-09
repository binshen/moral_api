/**
 * Created by bin.shen on 7/9/16.
 */

module.exports = function (mongoose) {

    var deviceRank = new mongoose.Schema({
        mac: { type:String, required:true },
        rank: { type:Number },
        created: { type:Number }
    }, {
        collection: 'device_ranks',
        id: false
    });
    return mongoose.model('DeviceRank', deviceRank);
};