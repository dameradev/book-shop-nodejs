const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node',
  password: '523970Aa'
});

module.exports = pool.promise();