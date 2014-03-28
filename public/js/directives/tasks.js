module.exports = function ($rootScope, Flash, quinto) {
  return {
    restrict: 'E',
    templateUrl: '/partials/tasks',
    link: function ($scope) {
      /*
       *  @about    Tasks filters
       *  ------
       */

      $scope.filters = {};

      /*
       *  @about    Upate breadcrumb  #TODO use some kind of router
       *  ------
       */

      $rootScope.PAGE = {
        name: 'Tasks',
        location: '/tasks'
      };

      /*
       *  @about    Get Task Model
       *  ------
       */

      quinto.get(
        'models',

        {
          find: {
            name: 'Task'
          },
          prefix: 'get Task Model'
        },

        function (models) {

          console.log('got models', models);

          $scope.TaskModel = models[0];

          $scope.filters.orderBy = $scope.TaskModel.order.default;

          $scope.$apply();
        },

        Flash.error
      );

      /*
       *  @about    Fetch list of tasks
       *  ------
       */

      quinto.get('tasks', { prefix: 'task list' },

        function (tasks) {
          console.log('got tasks', tasks);
          $scope.tasks = tasks;

          $scope.$apply();
        },

        Flash.error
      );

      /*
       *  @about    Watch tasks
       *  ------
       */

      $scope.$watch('tasks', function (tasks, _tasks) {
        if ( angular.isArray(tasks) ) {
          tasks.forEach(function (task, i) {
            /*
             *  @about    Get foreign project
             */
             
            if ( ! task.$project ) {
              task.$project = {
                id: task.project
              };
            }

            quinto.get('projects',
              {
                project: task.project,
                prefix: 'update project for task #' + i,
                clear: true
              },

              function (projects) {
                $scope.tasks[this.index].$project = projects[0];
                $scope.tasks[this.index].$status = {};

                projects[0].tasks.status.forEach(function (status) {
                  if ( status.id === $scope.tasks[this.index].status ) {
                    $scope.tasks[this.index].$status = status;
                  }
                }.bind(this));

                $scope.$apply();
              }.bind({ index: i }),

              Flash.error
            );
          });
        }
      });

      /*
       *  @about    Function to remove a task
       *  ------
       */

      $scope.remove = function (task, index) {
        if ( confirm('Are you sure you want to remove this task?') ) {
          Tasks.remove(task._id, function (error) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Successfully removed task ' + task.name);

            $scope.tasks.splice(index, 1);
          });
        }
      };
    }
  };
};