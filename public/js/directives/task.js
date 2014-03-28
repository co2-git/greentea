module.exports = function (Flash, $rootScope, quinto) {
  return {
    restrict: 'E',

    templateUrl: '/partials/task',

    scope: {
      id: '@'
    },

    link: function ($scope, $elem) {

      $scope.quinto = quinto;

      /*
       *  @about    Set context new task or existing task
       */

      if ( $scope.id === 'new' ) {
        $scope.isNew = true;
      }

      /*
       *  @about    The task scope model
       */

      $scope.task = {
        comments: []
      };

      /*
       *  @about    Update breadcrumbs #TODO use a router
       */

      $rootScope.PAGE = {
        name: 'New',
        location: '/tasks/new',
        parents: [
          {
            name: 'Tasks',
            location: '/tasks'
          }
        ]
      };

      /*
       *  @about    Get projects
       */

      quinto.get(
        'projects',

        {
          project: {},
          prefix: 'get projects for task ' +
            $scope.isNew ? Math.random() : $scope.id
        },

        function (projects) {
          console.log('got projects', projects);
          
          $scope.projects = projects;

          var hack = $scope.task.project;

          $scope.task.project = null;

          $scope.$apply();

          $scope.task.project = hack;

          $scope.$apply();
        },

        function (error) {
          Flash.error(error);
        }
      );

      /*
       *  @about    Get task if in view context
       */

      if ( ! $scope.isNew ) {
        quinto.get('tasks',

          {
            task: $scope.id,
            prefix: 'getting task ' + $scope.id
          },

          function (tasks) {
            console.log('got tasks', tasks);

            $scope.task = tasks[0];
            $scope.$apply();

            $rootScope.PAGE.name = $scope.task.name;
          },

          function (error) {
            Flash.error(error);
          }
        );
      }

      /*
       *  @about    Get project status on projects change
       */

      $scope.$watch('task.project', function (project, _project) {
        if ( angular.isString(project) ) {
          if ( angular.isArray($scope.projects) ) {
            $scope.projects.forEach(function (__project) {
              if ( __project._id === project ) {
                $scope.project_status = [];

                __project.tasks.status.forEach(function (status) {
                  $scope.project_status.push(status);
                });
              }
            });
          }
        }
      });

      $scope.$watch('task.name', function (name, _name) {
        if ( typeof _name === 'string' ) {
          $rootScope.PAGE.name = $scope.task.name;
          console.log($scope.task.name);
        }
      });

      $scope.save = function () {

        var update = {
          name: $scope.task.name,
          project: $scope.task.project,
          status: $scope.task.status,
          description: $scope.task.description,
          comments: $scope.task.comments
        };

        if ( ! update.name ) {
          return Flash.error(new Error('Missing task name'));
        }

        if ( ! update.project ) {
          return Flash.error(new Error('Missing task project'));
        }

        if ( ! update.status ) { console.log(update);
          return Flash.error(new Error('Missing task status'));
        }

        if ( ! update.description ) {
          return Flash.error(new Error('Missing task description'));
        }

        if ( ! update.comments ) {
          update.comments = [];
        }

        if ( $scope.isNew ) {
          quinto.insert(
            'tasks',

            {
              insert: update,
              prefix: 'inserting new task'
            },

            function (task) {
              Flash.success('inserted new task', task);
              $scope.id = task;
              $scope.task._id = task;
              $scope.isNew = false;
            },

            Flash.error
          );
        }
        else {
          quinto.update(
            'tasks',

            {
              task: $scope.id,
              update: update,
              prefix: 'update task #' + $scope.id              
            },

            function (tasks) {
              Flash.success('Task ' + $scope.task.name + ' saved');
            },

            Flash.error
          );
        }
      };

      $scope.remove = function () {
        if ( $scope.isNew ) {
          return;
        }

        if ( confirm('Are you sure you want to remove this task?') ) {
          quinto.remove('tasks',
            {
              prefix: 'remove task #' + $scope.id,
              remove: $scope.id
            },

            function () {
              Flash.success('Successfully removed task ' + $scope.task.name);

              $scope.task = [];

              $scope.isNew = true;
            },

            Flash.error
          );
          // Tasks.remove($scope.task._id, function (error) {
          //   if ( error ) {
          //     return Flash.error(error);
          //   }

          //   Flash.success('Successfully removed task ' + $scope.task.name);

          //   location.href='/tasks/new';
          // });
        }
      };

      $scope.publish = function () {
        if ( ! $scope.newComment ) {
          return Flash.error(new Error('Missing comment'));
        }

        quinto.update(
          'tasks',

          {
            task: $scope.id,
            prefix: 'adding comment to task #' + $scope.id,
            update: {
              $push: { 'comments': {
                what: $scope.newComment,
                when: +new Date()
              }}
            }
          }
        );
      };

      $scope.closeComment = function (comment) {
        if ( confirm('Are you sure you want to delete this comment?') ) {
          Tasks.update($scope.task._id, { $pull: { 'comments.id': comment.id } },
            function (error) {
              if ( error ) {
                return Flash.error(error);
              }

              $scope.task.comments.forEach(function (_comment, i) {
                if ( _comment.id === comment.id ) {
                  $scope.task.comments.splice(i, 1);
                }
              });
            });
        }
      };
    }
  };
};