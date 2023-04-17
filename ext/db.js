let sqlite3 = require('sqlite3').verbose();
let dbPersistent = new sqlite3.Database(__APPROOT + '/db/database.sqlite');

let dbMemory = new sqlite3.Database(':memory:');

module.exports = { dbPersistent, dbMemory };