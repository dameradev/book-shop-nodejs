const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
  constructor(username, email) {
    this.username = username;
    this.email = email;
  }

  save() {
    const db = getDb();
    db
      .collection('users') 
      .insertOne(this)
      .then(result=> {
        console.log('Created a user');
      })
      .catch(err=>console.log(err));
  }

  static findById(userId){ 
    const db = getDb();
    db.collection('users')
      .find({_id: new mongodb.ObjectID(userId)})
      .next()
      .then(user=> {
      return user
      })
      .catch(err=>console.log(err));
  }
}

module.exports = User;