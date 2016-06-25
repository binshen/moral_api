/**
 * Created by bin.shen on 6/25/16.
 */

var xml = require('xml');

module.exports = function (app, mongoose, config) {
    app.get('/upgrade', function(req, res, next) {
        var data = [{
            update: [
                { name: '摩瑞尔云' } ,
                { version: '0.2' },
                { url: 'http://121.40.92.176/apps/app-debug.apk' }
            ]
        }];
        res.send(xml(data, true));
    });
};