/**
 * Created by bin.shen on 6/20/16.
 */

var moment = require('moment');
var random = require("random-js")();
var common = require('../utils/common');
var wrap   = require('co-express');


module.exports = function (app, mongoose, config) {
    var Auth = mongoose.model('Auth');
    var User = mongoose.model('User');
    var Data = mongoose.model('Data');
    var Device = mongoose.model('Device');
    var Feedback = mongoose.model('Feedback');

    app.post('/user/login',function(req, res, next) {
        var username = req.body.username;
        var password = common.md5(req.body.password);
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

    app.post('/user/add_device', function(req, res, next) {
        var userID = req.body.userID;
        if(userID == null) {
            return res.status(200).json({ success:false, error: "用户信息丢失,请重新登录" });
        }
        var mac = req.body.mac;
        if(mac == null) {
            return res.status(200).json({ success:false, error: "Mac地址不能为空" });
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
                if(doc.userID == undefined || doc.userID == null) {
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
                    return res.status(200).json({ success:true, status: 4 });
                }
            }
        });
    });

    app.get('/user/:user/get_device', wrap(function* (req, res, next) {
        var userID = req.params.user;
        var docs = yield Device.find({ userID: userID }).select('mac name type status last_updated').sort({type:-1}).lean().exec();
        docs.forEach(function(doc){
            var mac = doc.mac;
            var last_updated = doc.last_updated;
            if(last_updated == null || Date.now() - last_updated >= 60000) {
                doc.status = 0;
            }
            var data = Data.findOne({ mac: mac, day: moment().format('YYYYMMDD') }).select('x1 x3 x9 x10 x11 x12 x13 x14 p1 p2 p3 p4 fei created -_id').sort({'created': -1}).limit(1).lean();
            if(data != null) {
                delete data['_id'];
                delete data['mac'];
                var x9 = parseFloat(data['x9']);
                if(x9 > 0) {
                    data['x9'] = Math.round(x9 * 100) / 100;
                }
            }
            doc.data = data;
        });
        res.status(200).json(docs == null || docs.length < 1 ? [] : docs);
    }));

    app.get('/user/:user/get_device_info',function(req, res, next) {
        var userID = req.params.user;
        Device.find({ userID: userID }).select('mac name type status last_updated').sort({type:-1}).lean().exec(function(err, docs) {
            if(err) return next(err);

            docs.forEach(function(doc){
                var last_updated = doc.last_updated;
                if(last_updated == null || Date.now() - last_updated >= 60000) {
                    doc.status = 0;
                }
            });
            return res.status(200).json(docs == null || docs.length < 1 ? [] : docs);
        });
    });

    app.post('/user/:user/update_name',function(req, res, next) {
        var userID = req.params.user;
        var userName = req.body.nickname;
        User.findOne({ _id: userID }, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                return res.status(200).json({ success:false, error:"该用户不存在" });
            }
            doc.nickname = userName;
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
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
                return res.status(200).json({ success:false, error:"指定的设备不存在" });
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
                return res.status(200).json({ success:false, error:"指定的设备不存在" });
            }
            doc.userID = undefined;
            doc.name = undefined;
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.post('/user/:user/online', wrap(function* (req, res, next) {
        var userID = req.params.user;
        var docs = yield Device.find({ userID: userID });
        if(docs == null || docs.length == 0) {
            return res.status(200).json({ success: true });
        }
        docs.forEach(function(doc){
            doc.app_status = 1;
            doc.app_last_updated = Date.now();
            doc.save(function(err) {});
        });
        return res.status(200).json({ success: true });
    }));

    app.post('/user/:user/offline', wrap(function* (req, res, next) {
        var userID = req.params.user;
        var docs = yield Device.find({ userID: userID });
        if(docs == null || docs.length == 0) {
            return res.status(200).json({ success: true });
        }
        docs.forEach(function(doc){
            doc.app_status = 0;
            doc.save(function(err) {});
        });
        return res.status(200).json({ success: true });
    }));

    app.post('/user/:user/change_psw', function(req, res, next) {
        var userID = req.params.user;
        var password = common.md5(req.body.password);
        var new_password = common.md5(req.body.new_password);
        User.findOne({_id: userID, password: password}, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                return res.status(200).json({ success:false, error:"输入的原密码不正确" });
            }
            doc.password = new_password;
            doc.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });

    app.post('/user/:user/feedback', function(req, res, next) {
        var userID = req.params.user;
        var feedback = req.body.feedback;
        var doc = new Feedback({ userID: userID, feedback: feedback, created: Date.now() });
        doc.save(function(err) {
            if(err) return next(err);
            return res.status(200).json({ success:true });
        });
    });

    app.post('/user/request_code', function(req, res, next) {
        var tel = req.body.tel;
        Auth.findOne({ tel: tel }, function(err, doc) {
            if (err) return next(err);
            var code = random.integer(100000, 999999);
            var msg = "【七星博士】您的验证码是：" + code;
            if(doc == null) {
                doc = new Auth({ tel: tel, code: code, created: Date.now() });
                doc.save(function(err) {
                    if(err) return next(err);
                    common.sendMsg(tel, msg, function() {});
                    return res.status(200).json({ success:true });
                });
            } else {
                var created = doc.created;
                if(Date.now() - created > 1800000) {
                    doc.code = code;
                    doc.created = Date.now();
                    doc.save(function(err) {
                        if(err) return next(err);
                        common.sendMsg(tel, msg, function() {});
                        return res.status(200).json({ success:true });
                    });
                } else {
                    return res.status(200).json({ success:false, error:"验证码未过期,请勿频繁请求验证码" });
                }
            }
        });
    });

    app.post('/user/register', function(req, res, next) {
        var username = req.body.username;
        var password = common.md5(req.body.password);
        var code = req.body.code;
        User.findOne({username: username}, function(err, doc) {
            if(err) return next(err);
            if(doc != null) {
                return res.status(200).json({ success:false, error:"您输入的手机号码已经注册过" });
            }
            Auth.findOne({ tel: username, code: code }, function(err, auth) {
                if(err) return next(err);
                if(auth == null) {
                    return res.status(200).json({ success:false, error:"您发送的验证码不正确" });
                } else {
                    var created = auth.created;
                    if(Date.now() - created > 1800000) {
                        return res.status(200).json({ success:false, error:"您发送的验证码已过期" });
                    } else {
                        doc = new User({ username: username, password: password });
                        doc.save(function(err) {
                            if(err) return next(err);
                            return res.status(200).json({ success:true });
                        });
                    }
                }
            });
        });
    });

    app.post('/user/forget_psw', function(req, res, next) {
        var username = req.body.username;
        var new_password = common.md5(req.body.password);
        var code = req.body.code;
        User.findOne({username: username}, function(err, doc) {
            if(err) return next(err);
            if(doc == null) {
                return res.status(200).json({ success:false, error:"您输入的手机号码不存在" });
            }
            Auth.findOne({ tel: username, code: code }, function(err, auth) {
                if(err) return next(err);
                if(auth == null) {
                    return res.status(200).json({ success:false, error:"您发送的验证码不正确" });
                } else {
                    var created = auth.created;
                    if(Date.now() - created > 1800000) {
                        return res.status(200).json({ success:false, error:"您发送的验证码已过期" });
                    } else {
                        doc.password = new_password;
                        doc.save(function(err) {
                            if(err) return next(err);
                            return res.status(200).json({ success:true });
                        });
                    }
                }
            });
        });
    });

/*
    app.post('/user/login',function(req, res, next) {
        var username = req.body.username;
        var password = common.md5(req.body.password);
        User.findOne({username: username, password: password}, function(err, user) {
            if(err) return next(err);

            Device.find({ userID: user._id }, function(err, docs) {
                if(err) return next(err);

                var count = docs.length;
                docs.forEach(function(doc){
                    doc.app_status = 1;
                    doc.app_last_updated = Date.now();
                    doc.save(function(err) {
                        if(err) return next(err);

                        count--;
                        if(count == 0) {
                            return res.status(200).json({
                                success:true,
                                user: user
                            });
                        }
                    });
                });
            });
        });
    });

    app.get('/user/:user/get_device',function(req, res, next) {
        var userID = req.params.user;
        Device.find({ userID: userID }).select('mac name type status last_updated').sort({type:-1}).lean().exec(function(err, docs) {
            if(err) return next(err);

            var count = docs.length;
            if(count == 0) {
                return res.status(200).json([]);
            }
            docs.forEach(function(doc){
                var mac = doc.mac;
                var last_updated = doc.last_updated;
                if(last_updated == null || Date.now() - last_updated >= 60000) {
                    doc.status = 0;
                }

                Data.findOne({
                    mac: mac,
                    day: moment().format('YYYYMMDD')
                }).select('x1 x3 x9 x10 x11 x12 x13 x14 p1 p2 p3 p4 fei created -_id').sort({'created': -1}).limit(1).lean().exec(function(err, data) {
                    if(err) return next(err);

                    count--;
                    if(data != null) {
                        delete data['_id'];
                        delete data['mac'];
                    }
                    doc.data = data;
                    if(count == 0) {
                        return res.status(200).json(docs == null || docs.length < 1 ? [] : docs);
                    }
                });
            });
        });
    });

    app.post('/user/:user/online',function(req, res, next) {
        var userID = req.params.user;
        Device.find({ userID: userID }, function(err, docs) {
            if(err) return next(err);

            var count = docs.length;
            if(count == 0) {
                return res.status(200).json({ success: true });
            }
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
            if(count == 0) {
                return res.status(200).json({ success: true });
            }
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
 */
};