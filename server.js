/*
 * ============================================================
 * GET DEPENDENCIES
 * ============================================================
*/

// shortcut to require
var $ =  require;

// get colors to display on terminal
$('colors');

// get express
var express = $('express');

// get http module
var http = $('http');

// get path module
var path = $('path');

/*
 * ============================================================
 * START EXPRESS
 * ============================================================
*/

var app = express();

/*
 * ============================================================
 * APP SETTINGS
 * ============================================================
*/

// set port to use
app.set('port', process.env.PORT || 46352)

// set view engine
app.set('view engine', 'jade');

// set view location
app.set('views', path.join(__dirname, 'views'));

/*
 * ============================================================
 * APP LOCAL VARIABLES
 * ============================================================
*/

app.locals.env = app.get('env');

app.locals.session = {};

app.locals.conns = [];

app.locals.getConn = function () {
  return app.locals.conns[0].db;
};

app.locals.errors = [];

/*
 * ============================================================
 * MIDDLEWARES
 * ============================================================
*/

/* Logger */
app.use(express.logger('dev'));

/* Automatically encode/decode URL */
app.use(express.urlencoded());

/* Automatically encode/decode URL */
app.use(express.json());

app.use(express.cookieParser(Math.random()));

app.use(function (req, res, next) {
  if ( app.locals.errors.length ) {
    res.error = app.locals.errors[0].error;
  }
  next();
});

/* Use our routes */
app.use(app.router);

/* Use static server */
app.use(express.static(path.join(__dirname, 'public')));

/* Error */
app.use($('./middlewares/error')(app));

/* Not found */
app.use($('./middlewares/not-found')(app));

/*
 * ============================================================
 * ROUTES
 * ============================================================
 */

/* LANDING PAGE */
app.get('/',
  $('./routes/index')(app)
);

/*
 * ============================================================
 * START SERVER
 * ============================================================
 */

/* Start HTTP server */
var server = http.createServer(app).listen(app.get('port'), function () {
  console.log(('Server started on port ' + app.get('port')).green);
});

/*
 * ============================================================
 * GET SOCKET
 * ============================================================
 */

/* Start Socket Server */
$('./lib/socket/socket')(server, app);

/*
 * ============================================================
 * ON EXIT
 * ============================================================
 */

process.on('exit', function () {
  $('child_process').spawn('unlink', [ __dirname + '/lock.pid']);
});

/*
 * ============================================================
 * CONNECT TO MONGO
 * ============================================================
 */

function connect () {
  if ( ! app.locals.conns.length ) {
    $('./lib/mongo/connect')(function (error, db) {
      setTimeout(connect, 1000);

      if ( error ) {
        app.locals.errors.push({
          date: +new Date(),
          error: error
        });
        return console.error(error);
      }

      app.locals.conns.push({
        db: db,
        uptime: +new Date()
      });
    });
  }
};

connect();