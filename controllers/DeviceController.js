/**
 * Created by bin.shen on 6/20/16.
 */

var moment = require('moment');
var Common = require('../utils/common');
var request = require('request');

module.exports = function (app, mongoose, config) {
    var Data = mongoose.model('Data');
    var Device = mongoose.model('Device');
    var DeviceTest = mongoose.model('DeviceTest');
    var DeviceRank = mongoose.model('DeviceRank');

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

/*
    app.get('/device/mac/:mac/get_history2',function(req, res, next) {
        var mac = req.params.mac;
        var day = req.query.day;
        Data.findOne({
            mac: mac,
            day: day
        }).limit(1).exec(function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc == null ? {} : doc);
        });
    });
*/

    app.get('/device/mac/:mac/get_history',function(req, res, next) {
        var mac = req.params.mac;
        var day = req.query.day;
        Data.aggregate([
            {
                $match: {
                    mac: mac,
                    day : day
                }
            },
            {
                $group: {
                    _id: null,
                    x1:  { $avg: "$x1" },
                    x3:  { $avg: "$x3" },
                    x9:  { $avg: "$x9" },
                    x10: { $avg: "$x10" },
                    x11: { $avg: "$x11" }
                }
            }
        ]).exec(function(err, docs) {
            if(err) return next(err);
            return res.status(200).json(docs == null || docs.length < 1 ? {} : docs[0]);
        });
    });

    app.get('/device/mac/:mac/get_test',function(req, res, next) {
        var mac = req.params.mac;
        DeviceTest.findOne({ mac: mac }).sort({ created: -1 }).exec(function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc == null ? {} : doc);
        });
    });

    app.get('/device/mac/:mac/get_rank',function(req, res, next) {
        var mac = req.params.mac;
        DeviceRank.findOne({ mac: mac }).sort({ created: -1 }).exec(function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc == null ? {} : doc);
        });
    });

    app.get('/device/mac/:mac/get_data',function(req, res, next) {
        var mac = req.params.mac;
        var data = Data.findOne({ mac: mac, day: moment().format('YYYYMMDD') }).select('x1 x2 x3 x9 x10 x11 created -_id').sort({'created': -1}).exec(function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc == null ? {} : doc);
        });
    });

    app.get('/device/code/:code/get_weather',function(req, res, next) {
        // var code = req.params.code;
        // //var url = 'http://mobile.weather.com.cn/data/sk/' + code + '.html';
        // var url = 'http://www.weather.com.cn/data/sk/' + code + '.html';
        // request(url, function (err, resp, body) {
        //     if(err) return next(err);
        //     return res.status(200).json(body == null ? {} : body);
        // });


        var code = req.params.code;
        //var url = 'http://mobile.weather.com.cn/data/sk/' + code + '.html';
        var url = 'http://www.weather.com.cn/data/sk/' + code + '.html';
        request(url, function (err, resp, body) {
            if(err) return next(err);

            var url1 = 'http://mobile.weather.com.cn/data/sk/' + code + '.html';
            request(url1, function (err1, resp1, body1) {
                if(err1) return res.status(200).json(body == null ? {} : body);

                var json_data = JSON.parse(body);
                var temp_data = JSON.parse(body1);
                console.log(temp_data);
                json_data["sk_info"] = temp_data["sk_info"]["temp"];
                json_data["weatherinfo"]["temp"] = json_data["weatherinfo"]["temp"] + "℃";

                return res.status(200).json(JSON.stringify(json_data));
            });
        });
    });

    app.get('/device/mac/:mac/get_data2',function(req, res, next) {
        var mac = req.params.mac;
        var data = Data.findOne({ mac: mac }).select('x1 x2 x3 x9 x10 x11 created -_id').sort({'created': -1}).exec(function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc == null ? {} : doc);
        });
    });
};