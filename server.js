/* Get dependencies */
require('colors');
var express = require('express');
var http = require('http');
var path = require('path');
var packagejson = require('./package.json');

/* Start Express */
var app = express();

app.locals.env = app.get('env');

app.set('port', process.env.PORT || 46352)

/* Template engine */
app.set('view engine', 'jade');

/* Views location */
app.set('views', path.join(__dirname, 'views'));

/* Logger */
app.use(express.logger('dev'));

/* Automatically encode/decode URL */
app.use(express.urlencoded());

/* Automatically encode/decode URL */
app.use(express.json());

app.use(express.cookieParser(Math.random()));


/* Use our routes */
app.use(app.router);

/* Use static server */
app.use(express.static(path.join(__dirname, 'public')));

/* Error */
app.use(require('./middlewares/error')(app));

/* Not found */
app.use(require('./middlewares/not-found')(app));

/* SESSION */

app.locals.session = {};

app.locals.conns = [];

app.locals.getConn = function () {
  return app.locals.conns[0].db;
};

app.locals.models = {};

console.log('Starting session'.green);

/* MIDDLEWARE: GOOGLE SESSION */
// var sessionMiddleware = require('./routes/middlewares/session')(app);

/*
 * ============================================================
 * ROUTES
 * ============================================================
 */

/* PARTIALS */
app.get('/partials/:partial',
  require('./routes/partials')(app)
);

/* LANDING PAGE */
app.get('/',
  require('./routes/landing-page')(app)
);

/* CLIENTS PAGE */
app.get('/clients',
  require('./routes/clients')(app)
);

/* VIEW CLIENT */
app.get('/clients/:client',
  require('./routes/client')(app)
);

/* PROJECTS PAGE */
app.get('/projects',
  require('./routes/projects')(app)
);

/* VIEW PROJECTS */
app.get('/projects/:project',
  require('./routes/project')(app)
);

/* INVOICES PAGE */
app.get('/invoices',
  require('./routes/invoices')(app)
);

/* TASKS PAGE */
app.get('/tasks',
  require('./routes/tasks')(app)
);

/* VIEW TASK */
app.get('/tasks/:task',
  require('./routes/task')(app)
);

app.get('/cache/queries/:query', function (req, res, next) {
  var queries = [];

  for ( var query in socketsQueries ) {
    var x = JSON.parse(query);

    queries.push({ args: x, results: socketsQueries[query] });
  }

  res.json(queries);
});

/* Start HTTP server */
var server = http.createServer(app).listen(app.get('port'), function () {
  console.log(('Server started on port ' + app.get('port')).green);
});

process.on('exit', function () {
  require('child_process').spawn('unlink', [ __dirname + '/lock.pid']);
})

var io = require('socket.io').listen(server);

var socketsQueries = {};

var tasks_id = {};

var socketActions = {
  'get tasks': function (args, socket) {
    var get = args.task;
    var prefix = args.prefix;

    if ( ! prefix ) {
      prefix = 'get tasks';
    }

    if ( ! socketsQueries['get tasks'] ) {
      socketsQueries['get tasks'] = {};
    }

    if ( socketsQueries['get tasks'][JSON.stringify(args)] ) {
      return socket.emit(prefix + 'ok', socketsQueries['get tasks'][JSON.stringify(args)]);
    }

    require('./lib/mongo/get')(app.locals.getConn(), 'tasks', get,
      function (error, tasks) {
        if ( error ) {
          return socket.emit(prefix + 'ko', {
            message: error.message || error.toString()
          });
        }
        socketsQueries['get tasks'][JSON.stringify(args)] = tasks;

        socket.emit(prefix + 'ok', tasks);

        tasks.forEach(function (task) {
          if ( ! tasks_id[task._id] ) {
            tasks_id[task._id] = [];
          }

           tasks_id[task._id].push(JSON.stringify(args));
        });
      });
  },

  'get projects': function (args, socket) {
    var get = args.project;
    var prefix = args.prefix;

    if ( ! prefix ) {
      prefix = 'get projects';
    }

    if ( ! socketsQueries['get projects'] ) {
      socketsQueries['get projects'] = {};
    }

    if ( socketsQueries['get projects'][JSON.stringify(args)] ) {
      socketsQueries['get projects'][JSON.stringify(args)].touched = +new Date();
      return socket.emit(prefix + 'ok', socketsQueries['get projects'][JSON.stringify(args)]);
    }

    require('./lib/mongo/get')(app.locals.getConn(), 'projects', get,
      function (error, projects) {
        if ( error ) {
          return socket.emit(prefix + 'ko', {
            message: error.message || error.toString()
          });
        }
        socketsQueries['get projects'][JSON.stringify(args)] = projects;
        socketsQueries['get projects'][JSON.stringify(args)].touched = +new Date();

        socket.emit(prefix + 'ok', projects);
      });
  },

  'get models': function (args, socket) {
    var get = args.find;
    var prefix = args.prefix;

    if ( ! prefix ) {
      prefix = 'get models';
    }

    if ( ! socketsQueries['get models'] ) {
      socketsQueries['get models'] = {};
    }

    if ( socketsQueries['get models'][JSON.stringify(args)] ) {
      return socket.emit(prefix + 'ok', socketsQueries['get models'][JSON.stringify(args)]);
    }

    require('./lib/mongo/get')(app.locals.getConn(), 'models', get,
      function (error, models) {
        if ( error ) {
          return socket.emit(prefix + 'ko', {
            message: error.message || error.toString()
          });
        }
        socketsQueries['get models'][JSON.stringify(args)] = models;

        socket.emit(prefix + 'ok', models);
      });
  },

  'update tasks': function (args, socket) {
    var get = args.task;
    var update = args.update;
    var prefix = args.prefix;

    if ( ! prefix ) {
      prefix = 'update tasks';
    }

    if ( ! update ) {
      return socket.emit(prefix + 'ko', {
        message: 'Update is empty'
      });
    }

    var conn = app.locals.getConn();

    require('./lib/mongo/update')(
      conn,
      'tasks',
      get,
      update,
      function (error) {
        if ( error ) {
          return socket.emit(prefix + 'ko', {
            message: error.message || error.toString()
          });
        }

        socket.emit(prefix + 'ok');

        require('./lib/mongo/get')(
          conn,
          'tasks',
          get,
          function (error, tasks) {
            if ( error ) {
              return socket.emit(prefix + 'ko', {
                message: error.message || error.toString()
              });
            }

            updateTasks(tasks);
          });
      });
  },

  'insert tasks': function (args, socket) {
    var get = args.task;
    var insert = args.insert;
    var prefix = args.prefix;

    if ( ! prefix ) {
      prefix = 'insert tasks';
    }

    if ( ! insert ) {
      return socket.emit(prefix + 'ko', {
        message: 'Insert is empty'
      });
    }

    var conn = app.locals.getConn();

    require('./lib/mongo/insert')(
      conn,
      'tasks',
      insert,
      function (error) {
        if ( error ) {
          return socket.emit(prefix + 'ko', {
            message: error.message || error.toString()
          });
        }

        socket.emit(prefix + 'ok');

        Object.keys(socketsQueries['get tasks']).forEach(function (options) {
          delete socketsQueries['get tasks'][options];
        });
      });
  },

  'remove tasks': function (args, socket) {
    var get = args.task;
    var remove = args.remove;
    var prefix = args.prefix;

    if ( ! prefix ) {
      prefix = 'remove tasks';
    }

    if ( ! remove ) {
      return socket.emit(prefix + 'ko', {
        message: 'Remove is empty'
      });
    }

    var conn = app.locals.getConn();

    require('./lib/mongo/remove')(
      conn,
      'tasks',
      remove,
      function (error) {
        if ( error ) {
          return socket.emit(prefix + 'ko', {
            message: error.message || error.toString()
          });
        }

        socket.emit(prefix + 'ok');
      });
  }
};

function updateTasks (tasks) {
  
  /* Loop fresh stack of tasks */
  
  tasks.forEach(function (freshTask) {
  
    /* Loop each get tasks queries */  

    Object.keys(socketsQueries['get tasks']).forEach(function (query) {

      /* Loop each tasks found in that query */
      
      socketsQueries['get tasks'][query].forEach(function (storedTask, i) {

        /* If stored task has the same id that fresh task, then update stored task with fresh task */
        
        if ( storedTask._id.toString() === freshTask._id.toString() ) {
          
          console.log('updating'.yellow);
          
          socketsQueries['get tasks'][query][i] = freshTask;
        


        }
      });
    });
  });
}

io.sockets.on('connection', function (socket) {

  console.log('Socket IO server connected with client');

  socket.emit('welcome');

  socket.broadcast.emit('flash', 'New user joined the chat');

  ['get tasks',
   'get projects',
   'update tasks',
   'insert tasks',
   'remove tasks',
   'get models']
    .forEach(function (query) {
      
      socket.on(query, function (args) {
      
        if ( ! socketActions[this.query] ) {
          return socket.emit((args.prefix || query) + 'ko', {
            message: 'No such query: ' + this.query
          });
        }
        
        socketActions[this.query](args, socket);
      
      }.bind({ query: query }));
    });


  socket.on('message', function (message) {
    socket.broadcast.emit('message', message);
  });
});

function processQueries () {
  setTimeout(processQueries, 1000);
};

processQueries();


function connect () {
  if ( ! app.locals.conns.length ) {
    require('./lib/mongo/connect')(function (error, db) {
      setTimeout(connect, 1000);

      if ( error ) {
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