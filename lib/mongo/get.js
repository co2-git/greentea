var r = require;

/*
 *  @about        Function to perfom a find query
 */

module.exports = function (db, collection, filter, callback) {
  
  try {

    /*
     *  @about    Validate function arguments
     */

    r('../util/validate')([
      [ db,             'Db'                    ],
      [ collection,     String                  ],
      [ filter,         [String, Object, null]  ],
      [ callback,       Function                ]
    ]);

    var query = r('./parse-filter')(filter);

    /*
     *  @about    Execute query
     */

    db
      .collection(collection)
        .find(query.find)
          .limit(query.limit)
          .sort(query.sort)
            .toArray(callback);
  }
  

  catch ( error ) {
    
    /*
     *  @about    Send error
     */

    console.log(error, error.stack);
    callback(error);
  }

};