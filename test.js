/**
 * Created by bin.shen on 6/22/16.
 */

// var moment = require('moment');
// var day = moment(1466610063007);
// console.log(day.format());

// var random = require("random-js")(); // uses the nativeMath engine
// var value = random.integer(100000, 999999);
// console.log(value)

//console.log(Date.now());

//1466990961788
//1466990982969

// var http = require('http');
// var options = {
//     host: 'send.18sms.com',
//     path: '/msg/HttpBatchSendSM?account=002011&pswd=XUwei10051&mobile=18118438026&msg=测试内容：您好！您的验证码是：123456.&needstatus=true',
//     method: 'GET'
// };
//
// var callback = function(response) {
//     var str = '';
//     response.on('data', function (chunk) {
//         str += chunk;
//     });
//     response.on('end', function () {
//         console.log(str);
//     });
// };
//
// http.request(options, callback).end();

// var a = '{"sk_info":{"date":"20131012","cityName":"北京","areaID":"101010100","temp":"21℃","tempF":"69.8℉","wd":"东风","ws":"3级","sd":"39%","time":"15:10","sm":"暂无实况"}}';
// console.log(JSON.parse(a))

// var random = require("random-js")();
// var code = random.integer(100000, 999999);
// var msg = "【七星博士】您的验证码是：" + code;
// var common = require('./utils/common');
// common.sendMsg("18118438026", msg, function(err, doc) {});


var random = require("random-js")();
var code = random.integer(100000, 999999);
var common = require('./utils/common');
common.sendMsg2("18118438026", code, function(err, doc) {
    console.log(err);
    console.log("+++++++++++++++++++++++++++++++++++++++");
    console.log(doc);
});