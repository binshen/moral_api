/**
 * Created by bin.shen on 6/20/16.
 */

var User = require('../models/User');
var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var User = mongoose.model('User');

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
};