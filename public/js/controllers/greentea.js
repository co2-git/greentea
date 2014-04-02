module.exports = function ($scope, Flash, Socket) {

  $scope.greentea = {};

  Socket.emit('version', {}, function (version) {
    $scope.greentea.version = version;
    $scope.$apply();
  });

  Socket.on('version changed', function (version) {
    $scope.greentea.version = version;
    $scope.$apply();
  });

  $scope.newTodo = {};
  
  $scope.todos = [];

  $scope.filter = {
    text: ''
  };

  $scope.$watch('filter.text', function (text, _text) {
    if ( typeof text === 'string' && ! text && $scope.showFilters ) {
      $scope.showFilters = false;
    }
  });

  Socket.emit('get',
    {
      limit: 50,
      sort: {
        done: 1
      }
    },

    function (error, gotten) {
      if ( error ) {
        return Flash.error(error);
      }

      console.log('got todos', gotten);

      $scope.todos = gotten;

      $scope.$apply();
    });

  /*  Add a new todo */

  $scope.add = function () {
    console.log($scope);
    if ( ! $scope.newTodo.name ) {
      return Flash.error(new Error('Missing new todo name'));
    }

    $scope.newTodo.moments = {
      created: +new Date()
    };

    Socket.emit('insert', $scope.newTodo, function (error, inserted) {
      if ( error ) {
        return Flash.error(error);
      }

      $scope.todos.push(inserted[0]);

      $scope.newTodo = {};

      $scope.$apply();
    });
  };

  $scope.remove = function (todo) {
    if ( confirm('Are you sure you want to delete this todo?') ) {
      Socket.emit('remove', todo._id, function (error) {
        console.log(arguments);
        if ( error ) {
          return Flash.error(error);
        }

        var rm;

        $scope.todos.forEach(function (_todo, i) {
          if ( _todo._id === todo._id ) {
            rm = i;
          }
        });

        $scope.todos.splice(rm, 1);

        $scope.$apply();
      });
    }
  };

  $scope.done = function (todo) {
    if ( todo.done ) {
      return;
    }

    Socket.emit('update',
      {
        find: todo._id,
        update: {
          $set: {
            done: true,
            'moments.done': +new Date()
          }
        }
      },
      function (error) {
        if ( error ) {
          return Flash.error(error);
        }

        $scope.todos.forEach(function (_todo, i) {
          if ( _todo._id === todo._id ) {
            console.log(_todo);
            $scope.todos[i].done = true;
            $scope.todos[i].moments.done = +new Date();
          }
        });

        $scope.$apply();
      });
  }


  $(document).on('keypress', function (e) {
    if ( $("[ng-model='newTodo.name']:focus").length ) {
      return;
    }

    if ( $("[ng-model='newTodo.description']:focus").length ) {
      return;
    }

    if ( e.keyCode === 13 || e.keyCode === 27 ) {
      $scope.showFilters = false;
      $scope.$apply();
      return;
    }

    // If search begins
    if ( ! $scope.showFilters ) {
      $scope.showFilters = true;
    }

    if ( ! $scope.filter.text ) {
      $scope.filter.text = String.fromCharCode(e.keyCode);
    }

    $("[ng-model='filter.text']").focus();

    
    $scope.$apply();

    if ( $scope.filter.text.length > 1 ) {
      $scope.filter.text += String.fromCharCode(e.keyCode);
    }
  });
};