$(document).foundation();

var socket = io.connect('http://127.0.0.1:46352');

var quinto = angular.module('quinto', []);

quinto.constant('QUINTO', {
  socket: socket
});

quinto.filter({
  fromNow: require('./filters/from-now')
});

quinto.factory({
  quinto: require('./services/quinto'),
  Flash: require('./services/flash')
});

quinto.directive({

  /*  =============================
   *  TASKS
   */

  quintoTasks: require('./directives/tasks'),
  quintoTask: require('./directives/task')
});

quinto.directive('contenteditable', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return; // do nothing if no ng-model
 
        // Specify how UI should be updated
        ngModel.$render = function() {
          element.html(ngModel.$viewValue || '');
        };
 
        // Listen for change events to enable binding
        element.on('blur keyup change', function() {
          scope.$apply(read);
        });
        read(); // initialize
 
        // Write data to the model
        function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if( attrs.stripBr && html == '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
        }
      }
    };
  });

quinto.run(function ($rootScope) {
  $rootScope.PAGE = {
    name: 'Home',
    location: '/',
    parents: []
  };
});