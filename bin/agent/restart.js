module.exports = function () {
  var $ = require,
    _ = $('./_');

  var services = ['http', 'mongodb'];

  if ( arguments[0] ) {
    services = [];

    for ( var i in arguments ) {
      services.push(arguments[i]);
    }
  }

  function stop (i) {
    if ( services[i] ) {
      $('./stop-' + services[i])(function (error) {
        if ( error ) {
          throw error;
        }
        console.log(('service ' + services[i] + ' is down').yellow);
        stop(i+1);
      });
    }
    else {
      start(0);
    }
  }

  function start (i) {
    if ( services[i] ) {
      $('./start-' + services[i])(function (error) {
        if ( error ) {
          throw error;
        }
        console.log(('service ' + services[i] + ' is up').green);
        start(i+1);
      });
    }
  }

  stop(0);
};