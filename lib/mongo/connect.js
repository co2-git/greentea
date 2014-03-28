module.exports = function libCoreMongoConnect (callback) {
  if ( typeof callback !== 'function' ) {
    return callback(new TypeError('Missing callback'));
  }

  var client = require('mongodb').MongoClient;
  var format = require('util').format;

  // if ( self.mongo ) {
  //   return self.emit('done', self.mongo);
  // }

  client.connect('mongodb://127.0.0.1:3079/quinto', callback);
};