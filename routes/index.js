module.exports = function landingPage (app) {
  return function (req, res, next) {
    if ( res.error ) {
      return next();
    }

    res.render('layouts/layout');
  };
};