/**
 * Created by bin.shen on 6/19/16.
 */

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var config = require("config");
var mongoose = require('mongoose');
var debug = require('debug')('api');
var FileStreamRotator = require('file-stream-rotator');
var logger = require('morgan');
var path = require('path');
var fs = require('fs');
var requireDir = require('require-dir');
var expressPromise = require('express-promise');

var app = express();
app.set("port", config.api.port);

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// var logDirectory = path.join(__dirname, 'log');
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// var accessLogStream = FileStreamRotator.getStream({
//     date_format: 'YYYYMMDD',
//     filename: path.join(logDirectory, 'access-%DATE%.log'),
//     frequency: 'daily',
//     verbose: false
// });
// app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride());
app.use(expressPromise());

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri);
mongoose.set('debug', false);

var models = requireDir(__dirname + '/models');
for(var i in models) { models[i](mongoose); }

var controlers = requireDir(__dirname + '/controllers');
for(var i in controlers) { controlers[i](app, mongoose, config); }

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).send({
        message: err.message,
        error: err
    });
});

module.exports = app;