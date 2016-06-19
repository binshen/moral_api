/**
 * Created by bin.shen on 6/19/16.
 */

var express = require('express');
var bodyParser = require('body-parser');
var config = require("config");
var mongoose = require('mongoose');
var debug = require('debug')('api');
var FileStreamRotator = require('file-stream-rotator');
var logger = require('morgan');
var path = require('path');
var fs = require('fs');

var app = express();
app.set("port", config.api.port);

var logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
});
app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(config.mongodb.uri);
fs.readdirSync(__dirname + "/models").forEach(function(file) {
    require(__dirname + "/models/" + path.basename(file, '.js'))(mongoose);
});

fs.readdirSync(__dirname + "/controllers").forEach(function(file) {
    require(__dirname + "/controllers/" + path.basename(file, '.js'))(app, mongoose, config);
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500).send({
        message: err.message,
        error: err
    });
});

module.exports = app;