/**
 * Created by bin.shen on 6/20/16.
 */

var User = require('../models/User');
var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var User = mongoose.model('User');

    app.get('/test/', function(req, res, next) {
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