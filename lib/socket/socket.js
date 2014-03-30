module.exports = function (server, app) {
  var $ = require;

  var validate = $('../util/validate');

  var io = $('socket.io').listen(server);

  io.sockets.on('connection', function (socket) {

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

    socket.on('update', function (find, update, callback) {
      try {
        validate([
          [ find,       [String, Object]  ],
          [ update,     Object            ],
          [ callback,   Function          ]
        ]);

        $('../mongo/update')(
          app.locals.getConn(),
          'todos',
          find,
          update,
          callback
        );
      }

      catch ( error ) {
        callback(error);
      }
    });

    socket.on('message', function (message) {
      socket.broadcast.emit('message', message);
    });
  });
};
