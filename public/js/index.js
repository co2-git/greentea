/*
 *  Start Foundation
 */

$(document).foundation();

/*
 *  Start socket client
 */

var socket = io.connect('http://127.0.0.1:46352');

/*
 *  Start Angular
 */

angular.module('greentea', [])
  
  .filter({
    fromNow: require('./filters/from-now')
  })

  .factory({
    Flash: require('./services/flash')
  })

  .controller({
    GreenTeaCtrl: require('./controllers/greentea')(socket)
  })

  .directive({
    contenteditable: require('./directives/contenteditable')(socket)
  });