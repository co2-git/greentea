module.exports = function (Clients, Flash, $rootScope) {
  return {
    restrict: 'E',

    templateUrl: '/partials/client',

    replace: false,

    scope: {
      id: '@'
    },

    link: function ($scope, $elem) {

      if ( $scope.id === 'new' ) {
        $scope.isNew = true;
      }

      if ( $scope.isNew ) {
        $scope.client = {};

        $rootScope.PAGE = {
          name: 'New',
          location: '/clients/new',
          parents: [
            {
              name: 'Clients',
              location: '/clients'
            }
          ]
        };
      }
      else {
        Clients.get($scope.id, function (error, clients) {
          if ( error ) {
            return Flash.error(error);
          }

          $scope.client = clients[0];

          $rootScope.PAGE = {
            name: $scope.client.name,
            location: '/clients/' + $scope.client._id,
            parents: [
              {
                name: 'Clients',
                location: '/clients'
              }
            ]
          };
        });
      }

      $scope.save = function () {
        var update = {
          name: $scope.client.name,
        };

        if ( ! update.name ) {
          return Flash.error(new Error('Missing client name'));
        }

        if ( $scope.isNew ) {
          Clients.insert(update, function (error, id) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Client saved');
            $scope.client._id = id;
            $scope.isNew = false;
          });
        }
        else {
          Clients.update($scope.client._id, update, function (error) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Client saved');
          });
        }
      };

      $scope.remove = function () {
        if ( $scope.isNew ) {
          return;
        }

        if ( confirm('Are you sure you want to remove this client?') ) {
          Clients.remove($scope.client._id, function (error) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Successfully removed client ' + $scope.client.name);

            location.href='/clients/new';
          });
        }
      };
    }
  };
};