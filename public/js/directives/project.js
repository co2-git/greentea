module.exports = function (Projects, Flash, $rootScope) {
  return {
    restrict: 'E',

    templateUrl: '/partials/project',

    replace: false,

    scope: {
      id: '@'
    },

    link: function ($scope, $elem) {

      if ( $scope.id === 'new' ) {
        $scope.isNew = true;
      }

      if ( $scope.isNew ) {
        $scope.project = {};

        $rootScope.PAGE = {
          name: 'New',
          location: '/projects/new',
          parents: [
            {
              name: 'Projects',
              location: '/projects'
            }
          ]
        };
      }
      else {
        Projects.get($scope.id, function (error, projects) {
          if ( error ) {
            return Flash.error(error);
          }

          $scope.project = projects[0];

          $rootScope.PAGE = {
            name: $scope.project.name,
            location: '/projects/' + $scope.project._id,
            parents: [
              {
                name: 'Projects',
                location: '/projects'
              }
            ]
          };          
        });
      }

      $scope.save = function () {
        var update = {
          name: $scope.project.name,
          client: $scope.project.client,
          description: $scope.project.description
        };

        if ( ! update.name ) {
          return Flash.error(new Error('Missing project name'));
        }

        if ( ! update.client ) {
          return Flash.error(new Error('Missing project client'));
        }

        if ( ! update.description ) {
          return Flash.error(new Error('Missing project description'));
        }

        if ( $scope.isNew ) {
          Projects.insert(update, function (error, id) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Task saved');
            $scope.project._id = id;
            $scope.isNew = false;
          });
        }
        else {
          Projects.update($scope.project._id, update, function (error) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Task saved');
          });
        }
      };

      $scope.remove = function () {
        if ( $scope.isNew ) {
          return;
        }

        if ( confirm('Are you sure you want to remove this project?') ) {
          Projects.remove($scope.project._id, function (error) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Successfully removed project ' + $scope.project.name);

            location.href='/projects/new';
          });
        }
      };
    }
  };
};