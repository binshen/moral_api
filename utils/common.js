/**
 * Created by bin.shen on 6/20/16.
 */

var crypto = require('crypto');
var request = require('request');
TopClient = require('./topClient').TopClient;

module.exports.md5 = function(value) {
    return crypto.createHash('md5').update(value).digest("hex");
};

module.exports.sendMsg = function(tel, msg, callback) {
    var msg = encodeURIComponent(msg);
    var url = "http://120.26.66.24/msg/HttpBatchSendSM?account=xxxxx&pswd=yyyyy&product=zzzzz&mobile="+tel+"&msg="+msg+"&needstatus=true";
    request(url, function (err, resp, body) {
        if(err) return callback(err);
        callback(null, body);
    });
};

module.exports.sendMsg2 = function(tel, code, callback) {
    var client = new TopClient({
        'appkey':'23531128',
        'appsecret':'b079269785183c5a7520da9b8047bb42',
        'REST_URL':'http://gw.api.taobao.com/router/rest'
    });

    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
        'extend' : '' ,
        'sms_type' : 'normal' ,
        'sms_free_sign_name' : '七星博士' ,
        'sms_param' : "{code:'" + code + "'}" ,
        'rec_num' : tel ,
        'sms_template_code' : "SMS_25781236"
    }, function(err, body) {
        if(err) return callback(err);
        callback(null, body);
    });
};