module.exports = function (Projects, Flash, $rootScope) {
  return {
    restrict: 'E',
    templateUrl: '/partials/projects',
    link: function ($scope) {
      $rootScope.PAGE = {
        name: 'Projects',
        location: '/projects'
      };

      Projects.get({}, function (error, projects) {
        if ( error ) {
          return Flash.error(error);
        }

        $scope.projects = projects;
      });

      $scope.remove = function (project, index) {
        if ( confirm('Are you sure you want to remove this project?') ) {
          Projects.remove(project._id, function (error) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Successfully removed project ' + project.name);

            $scope.projects.splice(index, 1);
          });
        }
      };
    }
  };
};