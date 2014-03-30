module.exports = function () {

  return function (time) {
    if ( typeof time === typeof 1 && time ) {
      return moment(time).fromNow();
    }
  };

};