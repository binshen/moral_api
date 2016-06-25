/**
 * Created by bin.shen on 6/25/16.
 */

var xml = require('xml');

module.exports = function (app, mongoose, config) {
    app.get('/upgrade', function(req, res, next) {
        var data = [{
            update: [
                { name: 'moral_android_app' } ,
                { version: 2 },
                { url: 'http://121.40.92.176/apps/app-debug.apk' }
            ]
        }];
        res.set('Content-Type', 'text/xml');
        res.send(xml(data, true));
    });
};