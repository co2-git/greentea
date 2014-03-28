module.exports = function routesInvoices (app) {
  return function (req, res, next) {
    if ( res.error ) {
      return next();
    }

    res.render('pages/invoices');
  };
};