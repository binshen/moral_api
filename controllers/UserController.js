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
    var DeviceType = mongoose.model('DeviceType');

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

    app.post('/user/add_device', wrap(function* (req, res, next) {
        var userID = req.body.userID;
        if(userID == null) {
            return res.status(200).json({ success:false, error: "用户信息丢失,请重新登录" });
        }
        var mac = req.body.mac;
        if(mac == null) {
            return res.status(200).json({ success:false, error: "Mac地址不能为空" });
        }
        mac = mac.toLowerCase();
        var type = 0;
        var deviceType = yield DeviceType.findOne({ mac: mac }).exec();
        if(deviceType != null) {
            type = deviceType.type;
        }

        if(type < 1) {
            var device = yield Device.findOne({ userID: userID, type: 1 }).exec();
            if(device == null) {
                return res.status(200).json({ success:false, error: "请先绑定一台环境数主机" });
            }
        }

        var doc = yield Device.findOne({ mac: mac }).exec();
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
    }));

    app.get('/user/:user/get_device', wrap(function* (req, res, next) {
        var userID = req.params.user;
        if(userID == null) {
            return res.status(200).json([]);
        }
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

    app.get('/user/:user/get_avg_data', function(req, res, next) {
        var userID = req.params.user;
        Device.find({ userID: userID }).select('mac -_id').sort({type:-1}).exec(function(err, docs) {
            var count = 0;
            var total_val = 0;
            docs.forEach(function(doc){
                /*
                Data.findOne({ mac: doc.mac, day: moment().format('YYYYMMDD') }).select('aqi').sort({'created': -1}).lean().exec(function(err, data) {
                    count++;
                    if(err == null && data != null) {
                        total_val += data.aqi;
                    }
                    if(count >= docs.length) {
                        return res.status(200).json({ "avg": count == 0 ? 0 : total_val/count });
                    }
                });
                */

                var v1 = v2 = v3 = v4 = v5 = v6 = 0;
                var z1 = z2 = z3 = z4 = z5 = z6 = 0;
                Data.findOne({ mac: doc.mac, day: moment().format('YYYYMMDD') }).select('x1 x9 x10 x11 x14 -_id').sort({'created': -1}).lean().exec(function(err, data) {
                    if(data.x1 != null && v1 < data.x1) v1 = data.x1;
                    if(data.x9 != null && v3 < data.x9) v3 = data.x9;
                    if(data.x11 != null && v4 < data.x11) v4 = data.x11;
                    if(data.x10 != null && v5 < data.x10) v5 = data.x10;
                    if(data.x14 != null && v6 < data.x14) v6 = data.x14;
                });
                //PM2.5
                if(v1 < 15) z1 = 0.00;
                else if (v1 >= 15 && v1 < 25) z1 = 0.05;
                else if (v1 >= 25 && v1 < 35) z1 = 0.10;
                else if (v1 >= 35 && v1 < 75) z1 = 0.25;
                else if (v1 >= 75 && v1 < 115) z1 = 0.50;
                else if (v1 >= 115 && v1 < 150) z1 = 0.75;
                else if (v1 >= 150 && v1 < 250) z1 = 1.10;
                else if (v1 >= 250) z1 = 2.00;
                //颗粒物
                z2 = 0;
                //甲醛
                if(v3 <= 1) z3 = 0.00;
                else if (v3 > 1 && v3 <= 2) z3 = 0.10;
                else if (v3 > 2 && v3 <= 4) z3 = 0.20;
                else if (v3 > 4 && v3 <= 6) z3 = 0.30;
                else if (v3 > 6 && v3 <= 8) z3 = 0.35;
                else if (v3 > 8 && v3 <= 10) z3 = 0.65;
                else if (v3 > 10 && v3 <= 20) z3 = 0.90;
                else if (v3 > 20 && v3 <= 30) z3 = 1.00;
                else if (v3 > 30 && v3 <= 50) z3 = 1.50;
                else if (v3 > 50) z3 = 2.00;
                //温度
                if(v4 <= 0) z4 = 2.00;
                else if(v4 > 0 && v4 <= 5) z4 = 1.00;
                else if(v4 > 5 && v4 <= 10) z4 = 0.75;
                else if(v4 > 10 && v4 <= 14) z4 = 0.50;
                else if(v4 > 14 && v4 <= 18) z4 = 0.25;
                else if(v4 > 18 && v4 <= 21) z4 = 0.15;
                else if(v4 > 21 && v4 <= 22) z4 = 0.10;
                else if(v4 > 22 && v4 <= 24) z4 = 0.05;
                else if(v4 > 24 && v4 <= 28) z4 = 0.00;
                else if(v4 > 28 && v4 <= 34) z4 = 0.25;
                else if(v4 > 34 && v4 <= 38) z4 = 0.80;
                else if(v4 > 38) z4 = 2.00;
                //湿度
                if(v5 <= 35) z5 = 0.10;
                else if(v5 > 35 && v5 <= 45) z5 = 0.05;
                else if(v5 > 45 && v5 <= 65) z5 = 0.00;
                else if(v5 > 65 && v5 <= 80) z5 = 0.05;
                else if(v5 > 80) z5 = 0.10;
                //光照强度
                if(v6 <= 10) z6 = 0.00;
                else if(v6 > 10 && v6 <= 20) z6 = 0.01;
                else if(v6 > 20 && v6 <= 30) z6 = 0.02;
                else if(v6 > 30 && v6 <= 40) z6 = 0.03;
                else if(v6 > 40 && v6 <= 50) z6 = 0.04;
                else if(v6 > 50 && v6 <= 60) z6 = 0.05;
                else if(v6 > 60 && v6 <= 70) z6 = 0.10;
                else if(v6 > 70 && v6 <= 80) z6 = 0.11;
                else if(v6 > 80 && v6 <= 90) z6 = 0.12;
                else if(v6 > 90) z6 = 0.15;
                return res.status(200).json({ "avg": parseInt((z1 + z2 + z3 + z4 + z5 + z6) * 100) });
            });
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
        if(tel == null || tel == "") {
            return res.status(200).json({ success:false, error:"系统错误，请重试" });
        }
        Auth.findOne({ tel: tel }, function(err, doc) {
            if (err) return next(err);
            var code = random.integer(100000, 999999);
            //var msg = "【七星博士】您的验证码是：" + code;
            if(doc == null) {
                doc = new Auth({ tel: tel, code: code, created: Date.now() });
                doc.save(function(err) {
                    if(err) return next(err);
                    //common.sendMsg(tel, msg, function(err, doc) {});
                    common.sendMsg2(tel, code, function(err, doc) {
                        console.log(err);
                        console.log("------------------------------------------------1");
                        console.log(doc);
                        if(err) {
                            return res.status(200).json({ success:false, error:"验证码发送失败，请稍后再试" });
                        }
                        return res.status(200).json({ success:true });
                    });
                });
            } else {
                var created = doc.created;
                if(Date.now() - created > 1800000) {
                    doc.code = code;
                    doc.created = Date.now();
                    doc.save(function(err) {
                        if(err) return next(err);
                        //common.sendMsg(tel, msg, function(err, doc) {});
                        common.sendMsg2(tel, code, function(err, doc) {
                            console.log(err);
                            console.log("------------------------------------------------2");
                            console.log(doc);
                            if(err) {
                                return res.status(200).json({ success:false, error:"验证码发送失败，请稍后再试" });
                            }
                            return res.status(200).json({ success:true });
                        });
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
                        doc = new User({ username: username, password: password, nickname: username });
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