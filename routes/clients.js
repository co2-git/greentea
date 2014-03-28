module.exports = function routesCLients (app) {
  return function (req, res, next) {
    if ( res.error ) {
      return next();
    }

    res.render('pages/clients');
  };
};