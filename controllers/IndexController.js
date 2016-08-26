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
                { message: "检测到新版本，需要立即更新吗?" },
                //{ url: 'http://121.40.92.176/apps/app-release.apk' }
                { url: 'http://www.7drlb.com/apps/app-release.apk' }
            ]
        }];
        res.set('Content-Type', 'text/xml');
        res.send(xml(data, true));
    });
};