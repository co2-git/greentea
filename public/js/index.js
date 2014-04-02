/*
 *  Start Foundation
 */

$(document).foundation();

/*
 *  Start Angular
 */

angular.module('greentea', [])
  
  .filter({
    fromNow: require('./filters/from-now'),
    howManyPending: require('./filters/how-many-pending')
  })

  .factory({
    Flash: require('./services/flash'),
    Socket: require('./services/socket')
  })

  .controller({
    GreenTeaCtrl: require('./controllers/greentea')
  })

  .directive({
    contenteditable: require('./directives/contenteditable')
  });