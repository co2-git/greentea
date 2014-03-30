module.exports = function (socket) {
  return function ($scope, Flash) {

    $scope.newTodo = {};
    
    $scope.todos = [];

    socket.emit('get', {}, function (error, gotten) {
      if ( error ) {
        return Flash.error(error);
      }

      $scope.todos = gotten;

      $scope.$apply();
    });

    $scope.add = function () {
      if ( ! $scope.newTodo.name ) {
        return Flash.error(new Error('Missing new todo name'));
      }

      $scope.newTodo.moments = {
        created: +new Date()
      };

      socket.emit('insert', $scope.newTodo, function (error, inserted) {
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
        socket.emit('remove', todo._id, function (error) {
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

      socket.emit('update', todo._id, { $set: {
          done: true,
          'moments.done': +new Date()
        } },
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
  };
};