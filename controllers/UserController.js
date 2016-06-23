/**
 * Created by bin.shen on 6/20/16.
 */

var moment = require('moment');
var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var User = mongoose.model('User');
    var Data = mongoose.model('Data');
    var Device = mongoose.model('Device');

    app.post('/user/login',function(req, res, next) {
        var username = req.body.username;
        var password = Common.md5(req.body.password);
        User.findOne({username: username, password: password}, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json({
                success:true,
                user: doc
            });
        });
    });

    app.get('/user/logout', function(req, res, next) {
        return res.status(200).json({ success:true });
    });

    app.post('/user/register', function(req, res, next) {
        var username = req.body.username;
        var password = Common.md5(req.body.password);
        User.findOne({username: username}, function(err, doc) {
            if(err) return next(err);
            if(doc != null) {
                return res.status(400).json({ success:false, error:"该手机号码已经注册过" });
            }
            doc = new User({ username: username, password: password });
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.post('/user/forget_psw', function(req, res, next) {
        var username = req.body.username;
        var password = Common.md5(req.body.password);
        var new_password = Common.md5(req.body.password);
        User.findOne({username: username, password: password}, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                return res.status(400).json({ success:false, error:"该用户不存在" });
            }
            doc.password = new_password;
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.post('/user/add_device', function(req, res, next) {
        var userID = req.body.userID;
        var mac = req.body.mac;
        Device.findOne({mac: mac}, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                doc = new Device({ mac: mac, userID: userID });
                doc.save(function(err) {
                    if(err) return next(err);
                    return res.status(200).json({ success:true, status: 1 });
                });
            } else {
                if(doc.userID == null) {
                    doc.userID = userID;
                    doc.save(function(err) {
                        if(err) return next(err);
                        return res.status(200).json({ success:true, status: 2 });
                    });
                } else {
                    return res.status(200).json({ success:true, status: 3 });
                }
            }
        });
    });

    app.get('/user/:user/get_device',function(req, res, next) {
        var userID = req.params.user;
        Device.find({ userID: userID }).lean().exec(function(err, docs) {
            if(err) return next(err);

            var count = docs.length;
            docs.forEach(function(doc){
                var mac = doc.mac;
                Data.findOne({
                    mac: mac,
                    day: moment().format('YYYYMMDD')
                }).sort({'created': -1}).limit(1).lean().exec(function(err, data) {
                    if(err) return next(err);

                    count--;
                    if(data != null) {
                        delete data['_id'];
                        delete data['mac'];
                    }
                    doc.data = data;
                    if(count == 0) {
                        return res.status(200).json(docs);
                    }
                });
            });
        });
    });

    app.post('/user/:user/device/:device/update_name',function(req, res, next) {
        var userID = req.params.user;
        var deviceID = req.params.device;
        var deviceName = req.body.name;
        Device.findOne({ userID: userID, _id: deviceID }, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                return res.status(400).json({ success:false, error:"指定的设备不存在" });
            }
            doc.name = deviceName;
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.post('/user/:user/device/:device/unbind',function(req, res, next) {
        var userID = req.params.user;
        var deviceID = req.params.device;
        var deviceName = req.body.name;
        Device.findOne({ userID: userID, _id: deviceID }, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                return res.status(400).json({ success:false, error:"指定的设备不存在" });
            }
            doc.userID = undefined;
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.post('/user/:user/online',function(req, res, next) {
        var userID = req.params.user;
        Device.find({ userID: userID }, function(err, docs) {
            if(err) return next(err);

            var count = docs.length;
            docs.forEach(function(doc){
                doc.app_status = 1;
                doc.app_last_updated = Date.now();
                doc.save(function(err) {
                    if(err) return next(err);

                    count--;
                    if(count == 0) {
                        return res.status(200).json({ success: true });
                    }
                });
            });
        });
    });

    app.post('/user/:user/offline',function(req, res, next) {
        var userID = req.params.user;
        Device.find({ userID: userID }, function(err, docs) {
            if(err) return next(err);

            var count = docs.length;
            docs.forEach(function(doc){
                doc.app_status = 0;
                doc.save(function(err) {
                    if(err) return next(err);

                    count--;
                    if(count == 0) {
                        return res.status(200).json({ success: true });
                    }
                });
            });
        });
    });
};