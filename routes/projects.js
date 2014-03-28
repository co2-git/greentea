module.exports = function routesProjects (app) {
  return function (req, res, next) {
    if ( res.error ) {
      return next();
    }

    res.render('pages/projects', {
      pages: app.locals.pages.concat([
        {
          name: 'Projects',
          location: '/projects'
        }])
    });
  };
};