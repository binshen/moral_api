/**
 * Created by bin.shen on 6/20/16.
 */

var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var User = mongoose.model('User');
    var Device = mongoose.model('Device');

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
                return res.status(400).json({ success:false, error:"该手机号码已经注册过" });
            }
            var user = new User({ username: username, password: password });
            user.save(function(err) {
                if(err) return next(err);
                return res.status(200).json({ success:true });
            });
        });
    });
};