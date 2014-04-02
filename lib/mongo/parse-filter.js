module.exports = function (filter) {
  var query = {
    find: {},
    limit: 50,
    sort: {
      _id: 1
    }
  };

  if ( typeof filter === 'string' ) {
    filter = { _id: filter };
  }

  for ( var key in filter ) {
    if ( key === '_id' ) {
      if ( typeof filter[key] === 'string' ) {
        query.find._id = require('mongodb').ObjectID(filter[key]);
      }
      else if ( filter[key].constructor.name === 'ObjectID' ) {
        query.find._id = filter[key]
      }
    }

    if ( key === 'limit' && ! isNaN(filter[key]) ) {
      query.limit = filter[key];
    }

    if ( key === 'sort' && typeof filter[key] === 'object' && filter[key].constructor === Object ) {
      query.sort = filter[key];
    }
  }

  console.log()
  console.log()
  console.log()
  console.log()
  console.log()
  console.log()
  console.log()
  console.log()
  console.log(query)
  console.log()
  console.log()
  console.log()
  console.log()
  console.log()
  console.log()

  return query;
};