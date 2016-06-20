/**
 * Created by bin.shen on 6/20/16.
 */

var Common = require('../utils/common');

module.exports = function (app, mongoose, config) {
    var Device = mongoose.model('Device');

    app.post('/device/get_list',function(req, res, next) {
        var userID = req.body.userID;
        Device.find({ userID: userID }, function(err, doc) {
            if(err) return next(err);
            return res.status(200).json(doc);
        });
    });
};