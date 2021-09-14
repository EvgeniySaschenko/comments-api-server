let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(__APPROOT + '/db/database.sqlite');

module.exports = db;