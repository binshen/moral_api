/**
 * Created by bin.shen on 6/20/16.
 */

var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var Device = mongoose.model('Device');
    var Data = mongoose.model('Data');

    app.get('/device/mac/:mac/get',function(req, res, next) {
        var mac = req.params.mac;
        Device.find({ mac: mac }, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc);
        });
    });

    app.get('/device/mac/:mac/get_current_data',function(req, res, next) {
        var mac = req.params.mac;
        var options = {
            limit: 1,
            sort: "date"
        };
        Data.find({ mac: mac }, options, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc);
        });
    });
};