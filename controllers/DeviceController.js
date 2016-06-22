/**
 * Created by bin.shen on 6/20/16.
 */

var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var Device = mongoose.model('Device');

    app.get('/device/mac/:mac/get',function(req, res, next) {
        var mac = req.params.mac;
        Device.find({ mac: mac }, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc);
        });
    });
};