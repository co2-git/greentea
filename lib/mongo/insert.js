module.exports = function libCoreMongoGet (db, collection, insert, callback) {

  var $ = require;

  try {
    $('../util/validate')([
      [ db,             'Db'     ],
      [ collection,     String   ],
      [ insert,         Object   ],
      [ callback,       Function ]
    ]);

    db.collection(collection)
      .insert(insert, callback);
  }

  catch ( error ) {
    callback(error);
  }

};