/**
 * Created by bin.shen on 6/20/16.
 */

var moment = require('moment');
var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var Data = mongoose.model('Data');
    var Device = mongoose.model('Device');

    app.get('/device/mac/:mac/get',function(req, res, next) {
        var mac = req.params.mac;
        Device.find({ mac: mac }, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc);
        });
    });

    // app.get('/device/mac/:mac/get_current',function(req, res, next) {
    //     var mac = req.params.mac;
    //     //var today = moment().startOf('day');
    //     //var tomorrow = moment(today).add(1, 'days');
    //     Data.find({
    //         mac: mac,
    //         day: moment().format('YYYYMMDD'),
    //         //created: { $gte: today.valueOf(), $lt: tomorrow.valueOf() }
    //     }).sort({'created': -1}).limit(1).exec(function(err, doc) {
    //         if(err) return next(err);
    //         return res.status(200).json(doc);
    //     });
    // });

    app.get('/device/mac/:mac/get_history',function(req, res, next) {
        var mac = req.params.mac;
        var day = req.query.day;
        Data.findOne({
            mac: mac,
            day: day
        }).sort({'created': -1}).limit(1).exec(function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc == null ? {} : doc);
        });
    });
};