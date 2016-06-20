/**
 * Created by bin.shen on 6/20/16.
 */

var crypto = require('crypto');

module.exports.md5 = function(value) {
    return crypto.createHash('md5').update(value).digest("hex");
};