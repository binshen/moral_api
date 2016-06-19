/**
 * Created by bin.shen on 6/19/16.
 */

var http = require("http");
var app = require("./app.js");

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});