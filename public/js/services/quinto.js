module.exports = function (QUINTO) {
  return {
    get: function (query, options, ok, ko) {
      query = 'get ' + query;
      var prefix = options.prefix || query;

      if ( options.clear ) {
        QUINTO.socket.removeAllListeners(prefix + 'ok');
        QUINTO.socket.removeAllListeners(prefix + 'ko');
      }

        /*
         *  @about    On get task error
         */

      QUINTO.socket.on(prefix + 'ko', ko);

        /*
         *  @about    On get task
         */

      QUINTO.socket.on(prefix + 'ok', ok);

        /*
         *  @about    Call get task
         */

      QUINTO.socket.emit(query, options);
    },

    update: function (query, options, ok, ko) {
      query = 'update ' + query;
      var prefix = options.prefix;
      var update = options.update;

      if ( options.clear ) {
        QUINTO.socket.removeAllListeners(prefix + 'ok');
        QUINTO.socket.removeAllListeners(prefix + 'ko');
      }

        /*
         *  @about    On get task error
         */

      QUINTO.socket.on(prefix + 'ko', ko);

        /*
         *  @about    On get task
         */

      QUINTO.socket.on(prefix + 'ok', ok);

        /*
         *  @about    Call get task
         */

      QUINTO.socket.emit(query, options);
    },

    insert: function (query, options, ok, ko) {
      query = 'insert ' + query;
      var prefix = options.prefix || query;
      var insert = options.insert;

      if ( options.clear ) {
        QUINTO.socket.removeAllListeners(prefix + 'ok');
        QUINTO.socket.removeAllListeners(prefix + 'ko');
      }

        /*
         *  @about    On get task error
         */

      QUINTO.socket.on(prefix + 'ko', ko);

        /*
         *  @about    On get task
         */

      QUINTO.socket.on(prefix + 'ok', ok);

        /*
         *  @about    Call get task
         */

      QUINTO.socket.emit(query, options);
    },

    remove: function (query, options, ok, ko) {
      query = 'remove ' + query;
      var prefix = options.prefix || query;
      var remove = options.remove;

      if ( options.clear ) {
        QUINTO.socket.removeAllListeners(prefix + 'ok');
        QUINTO.socket.removeAllListeners(prefix + 'ko');
      }

        /*
         *  @about    On get task error
         */

      QUINTO.socket.on(prefix + 'ko', ko);

        /*
         *  @about    On get task
         */

      QUINTO.socket.on(prefix + 'ok', ok);

        /*
         *  @about    Call get task
         */

      QUINTO.socket.emit(query, options);
    },

    now: function (time) {
      // return 'cool';
      return moment(time).fromNow();
    }
  };
};