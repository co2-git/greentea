module.exports = function () {

  return function (todos) {
    if ( angular.isArray(todos) ) {
      var pending = todos.reduce(
      	function (counter, todo) {
      		return todo.done ? counter : counter + 1;
      	}, 0);

      return pending;
    }
  };

};