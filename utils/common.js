/**
 * Created by bin.shen on 6/20/16.
 */

var http = require('http');
var crypto = require('crypto');

module.exports.md5 = function(value) {
    return crypto.createHash('md5').update(value).digest("hex");
};

module.exports.sendMsg = function(tel, msg, callback) {
    http.request({
        host: 'send.18sms.com',
        path: '/msg/HttpBatchSendSM?account=002011&pswd=XUwei10051&mobile='+tel+'&msg='+msg+'&needstatus=true',
        method: 'GET'
    }, function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            callback(str);
        });
    }).end();
};