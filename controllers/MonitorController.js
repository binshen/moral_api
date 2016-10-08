/**
 * Created by bin.shen on 10/8/16.
 */

var moment = require('moment');
var amqp = require('amqplib/callback_api');
var uri = 'amqp://guest:guest@121.40.92.176';

var data = {
    1: {"mac":"mac_1", "key":1, "lng": "116.395645", "lat": "39.929986"},
    2: {"mac":"mac_2", "key":2, "lng": "124.338543", "lat": "40.129023"},
    3: {"mac":"mac_3", "key":3, "lng": "118.103886", "lat": "24.489231"},
    4: {"mac":"mac_4", "key":4, "lng": "91.750644", "lat": "29.229027"}
};

module.exports = function (app, mongoose, config) {

    app.get('/monitor/location/:loc/level/:lvl',function(req, res, next) {
        var loc = req.params.loc;
        var lvl = parseInt(req.params.lvl);
        amqp.connect(uri, function(err, conn) {
            conn.createChannel(function(err, ch) {
                var ex = 'ex_alarm';
                var json = data[loc];
                json["lvl"] = lvl;
                json["created"] = moment().format('YYYY-MM-DD HH:mm:ss');
                var msg = JSON.stringify(json);
                ch.assertExchange(ex, 'fanout', {durable: false});
                ch.publish(ex, '', new Buffer(msg));
                console.log(" [x] Sent %s", msg);
            });
            setTimeout(function() {
                conn.close();
                res.status(200).json({ success:true });
            }, 500);
        });
    });
};