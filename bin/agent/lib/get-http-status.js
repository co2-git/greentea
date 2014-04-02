module.exports = function (callback) {
  var $ = require,
    _ = $('../_');

  $('fs').readFile($('path').join(_.path, 'lock.pid'), { encoding: 'utf-8' },
    function (error, data) {
      if ( error ) {
        return callback(null, false);
      }
      
      if ( ! data ) {
        return callback(null, false);
      }

      try {
        var pid = JSON.parse(data.trim());
      }
      catch ( error ) {
        return callback(error);
      }

      if ( isNaN(pid) ) {
        return callback(new Error('PID is not a number'));
      }

      try {
        process.kill(+pid, 0);
      }
      catch ( error ) {
        console.log('got error'.red, error);
        
        return $('fs').unlink($('path').join(_.path, 'lock.pid'),
          function (error) {
            if ( error ) {
              return callback(error);
            }

            callback(null, false);
          });
      }

      return callback(null, true, pid);
    });
};