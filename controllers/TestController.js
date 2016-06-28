/**
 * Created by bin.shen on 6/20/16.
 */

var Common = require('../utils/common');
var random = require("random-js")();

module.exports = function (app, mongoose, config) {
    var Auth = mongoose.model('Auth');
    var User = mongoose.model('User');
    var Data = mongoose.model('Data');
    var Device = mongoose.model('Device');
    var Feedback = mongoose.model('Feedback');

    app.get('/test/add_device', function(req, res, next) {
        var userID = "5766a035f08504e7cd3fb33e";
        var mac = "accf23b87fa2";
        if(mac == null) {
            return res.status(200).json({ success:false, error: "" });
        }
        mac = mac.toLowerCase();
        Device.findOne({ mac: mac }, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                doc = new Device({ mac: mac, userID: userID, status: 1, last_updated: Date.now(), app_status: 1, app_last_updated: Date.now() });
                doc.save(function(err) {
                    if(err) return next(err);
                    return res.status(200).json({ success:true, status: 1 });
                });
            } else {
                if(doc.userID == null) {
                    doc.userID = userID;
                    doc.status = 1;
                    doc.last_updated = Date.now();
                    doc.app_status = 1;
                    doc.app_last_updated = Date.now();
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

    app.get('/test/verify_code', function(req, res, next) {
        var tel = req.query.tel;
        Auth.findOne({ tel: tel }, function(err, doc) {
            if (err) return next(err);
            var code = random.integer(100000, 999999);
            if(doc == null) {
                doc = new Auth({ tel: tel, code: code, created: Date.now() });
                doc.save(function(err) {
                    if(err) return next(err);
                    return res.status(200).json({ success:true });
                });
            } else {
                var created = doc.created;
                if(Date.now() - created > 1000 * 60) {
                    doc.code = code;
                    doc.created = Date.now();
                    doc.save(function(err) {
                        if(err) return next(err);
                        return res.status(200).json({ success:true });
                    });
                } else {
                    return res.status(200).json({ success:true });
                }
            }
        });
    });

    app.get('/user/register', function(req, res, next) {
        var username = "13999999999";
        var password = Common.md5("888888");
        User.findOne({username: username}, function(err, doc) {
            if(err) return next(err);
            if(doc != null) {
                return res.status(200).json({ success:false, error:"该手机号码已经注册过" });
            }
            doc = new User({ username: username, password: password });
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.get('/test/login',function(req, res, next) {
        var username = "13999999999";
        var password = Common.md5("888888");
        User.findOne({username: username, password: password}, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json({
                success:true,
                user: doc
            });
        });
    });

    app.get('/test/update_name',function(req, res, next) {
        var userID = "5766a035f08504e7cd3fb33e";
        var deviceID = "5763c01ffc3b879a1b718fde";
        var deviceName = "test123";
        Device.findOne({ userID: userID, _id: deviceID }, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                return res.status(200).json({ success:false, error:"指定的设备不存在" });
            }
            doc.name = deviceName;
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.get('/test/c',function(req, res, next) {
        var userID = "5766a035f08504e7cd3fb33e";
        Device.find({ userID: userID }, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc);
        });
    });

    app.get('/test/b', function(req, res, next) {
        var userID = "5766a035f08504e7cd3fb33e";
        var mac = "accf23b87fa2";
        Device.findOne({ mac: mac }, function(err, doc) {
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
                } else if(doc.userID == userID) {
                    return res.status(200).json({ success:true, status: 3 });
                } else {
                    return res.status(200).json({ success:true, status: 4 });
                }
            }
        });
    });

    app.get('/test/a', function(req, res, next) {
        var username = "13999999999";
        var password = Common.md5("888888");
        User.findOne({username: username}, function(err, doc) {
            if(err) return next(err);
            if(doc != null) {
                return res.status(200).json({ success:false, error:"该手机号码已经注册过" });
            }
            var user = new User({ username: username, password: password });
            user.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });
};