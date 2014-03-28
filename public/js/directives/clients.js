module.exports = function (Clients, Flash, $rootScope) {
  return {
    restrict: 'E',
    templateUrl: '/partials/clients',
    link: function ($scope) {
      $rootScope.PAGE = {
        name: 'Clients',
        location: '/clients'
      };

      Clients.get({}, function (error, clients) {
        if ( error ) {
          return Flash.error(error);
        }

        $scope.clients = clients;
      });

      $scope.remove = function (client, index) {
        if ( confirm('Are you sure you want to remove this client?') ) {
          Clients.remove(client._id, function (error) {
            if ( error ) {
              return Flash.error(error);
            }

            Flash.success('Successfully removed client ' + client.name);

            $scope.clients.splice(index, 1);
          });
        }
      };
    }
  };
};