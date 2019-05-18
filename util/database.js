const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true });

let _db;

const mongoConnect = callback => {
  client.connect()
  .then(client=> {
    console.log('Connected!');
    _db = client.db('shop')
    callback()
  })
  .catch(err=>{
    console.log(err);
    throw err;
  })
}

const getDb = () => {
  if (_db) {
    return _db;
  }
  return undefined;
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
