module.exports = function(Flash, Socket) {
  return {
    restrict: 'A',

    link: function ($scope, $elem, $attrs) {
      if ( $attrs.ngModel && $attrs.scope && $attrs.name ) {
        $elem.text($scope[$attrs.scope][$attrs.name]);

        $scope.$watch([$attrs.scope, $attrs.name].join('.'),
          function (newVal, oldVal) {
            if ( newVal !== $elem.text() ) {
              $elem.text(newVal || '');
            }
          });

        $elem.on('blur', function () {
          if ( $scope[$attrs.scope][$attrs.name] !== $elem.text() ) {
            $scope[$attrs.scope][$attrs.name] = $elem.text();
            $scope.$apply();

            if ( 'saveTodoOnChange' in $attrs ) {
              var set = { $set: {} };

              set.$set[$attrs.name] = $scope.todo[$attrs.name];

              Socket.emit('update',
                {
                  find: $scope.todo._id,
                  update: set
                },
                function (error) {
                  if ( error ) {
                    return Flash.error(error);
                  }
                }
              );
            }
          }
        });
      }
    }
  };
};