/**
 * Created by bin.shen on 6/19/16.
 */

var crypto = require('crypto');
var User = require('../models/User');

module.exports = function (app, mongoose, config) {
    var User = mongoose.model('User');

    app.get('/', function(req, res, next) {
        return res.status(200).json({ success:true });
    });

    app.post('/user/login',function(req, res, next) {
        var username = req.body.username;
        var password = crypto.createHash('md5').update(req.body.password).digest("hex");
        User.findOne({username: username, password: password}, function(err, user) {
            if(err) return next(err);
            return res.status(200).json({
                success:true,
                user: user
            });
        });
    });
};