module.exports = function (server, app) {
  var $ = require;

  var validate = $('../util/validate');

  var io = $('socket.io').listen(server);

  var pkg;

  var _pkg = $('path').join($('path').dirname($('path').dirname(__dirname)), 'package.json');

  var fsocket;

  function readPackage (cb) {
    $('fs').readFile(_pkg,
      { encoding: 'utf-8' },
      function (error, data) {
        if ( error ) {
          return;
        }
        try {
          pkg = JSON.parse(data); 
        }
        catch ( error ) {
          return;
        }
        if ( typeof cb === 'function' ) {
          cb();
        }
      });
  }

  readPackage();

  $('fs').watch(_pkg,
    function (event, filename) {
      readPackage(function () {
        fsocket().emit('version changed', pkg.version);
      });
    });

  io.sockets.on('connection', function (socket) {

    fsocket = function () {
      return socket;
    }

    socket.emit('welcome');

    socket.on('insert', function (insert, callback) {
      try {
        validate([
          [ insert,   Object    ],
          [ callback, Function  ]
        ]);

        $('../mongo/insert')(
          app.locals.getConn(),
          'todos',
          insert,
          callback
        );
      }

      catch ( error ) {
        callback(error);
      }
    });

    socket.on('get', function (get, callback) {
      try {
        validate([
          [ get,      Object    ],
          [ callback, Function  ]
        ]);

        $('../mongo/get')(
          app.locals.getConn(),
          'todos',
          get,
          callback
        );
      }

      catch ( error ) {
        callback(error);
      }
    });

    socket.on('remove', function (remove, callback) {
      try {
        validate([
          [ remove,     [String,Object] ],
          [ callback,   Function        ]
        ]);

        $('../mongo/remove')(
          app.locals.getConn(),
          'todos',
          remove,
          callback
        );
      }

      catch ( error ) {
        callback(error);
      }
    });

    socket.on('update', function (update, callback) {
      try {
        validate([
          [ update,         Object                  ],
          [ update.find,    [Object, String, null]  ],
          [ update.update,  [Object, String, null]  ],
          [ callback,       Function                ]
        ]);

        $('../mongo/update')(
          app.locals.getConn(),
          'todos',
          update.find,
          update.update,
          callback
        );
      }

      catch ( error ) {
        callback(error);
      }
    });

    socket.on('version', function (options, callback) {
      console.log('youhooooooooooooooooooooooooooooou');
      callback(pkg.version);
    })

    socket.on('message', function (message) {
      console.log('youhooooooooooooooooooooooooooooou');
      socket.broadcast.emit('message', message);
    });
  });
};
