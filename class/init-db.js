let { dbMemory, dbPersistent } = require(__APPROOT + '/ext/db');

class InitDb {
  tables = ['comment', 'comment_vote', 'user'];

  async init() {
    //await this.deleteTablesMemoryDb();
    let dataTables = await this.getAllDataPersistentDb();
    await this.createTablesMemoryDb();
    await this.setDataMemoryDb(dataTables);
  }
  // get all data from persistent database
  async getAllDataPersistentDb() {
    let results = {};

    for await (let table of this.tables) {
      let stmt = dbPersistent.prepare(`SELECT * FROM ${table}`);
      let data = await new Promise((resolve, reject) => {
        stmt.all((error, result)=>{
          console.error(error);
          if (error) reject({ error });
          resolve(result);
        });
      });
      results[table] = data;
    }
    return results;
  }

  async createTablesMemoryDb() {
    let user = dbMemory.prepare(`CREATE TABLE user (
      id INTEGER PRIMARY KEY, 
      name TEXT, 
      dateCreate INTEGER)`);

    let comment = dbMemory.prepare(`CREATE TABLE comment (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      userIdEdit INTEGER,
      parentId INTEGER,
      isAvatar INTEGER,
      text TEXT,
      files TEXT,
      dislike INTEGER,
      like INTEGER,
      dateCreate INTEGER,
      dateUpdate INTEGER)`);

    let comment_vote = dbMemory.prepare(`CREATE TABLE comment_vote (
      id INTEGER PRIMARY KEY,
      commentId INTEGER,
      userId INTEGER,
      voteValue INTEGER,
      dateCreate INTEGER,
      dateUpdate INTEGER)`);

    await new Promise((resolve, reject) => {
      user.run((error, result)=>{
        console.error(error);
        if (error) reject({ error });
        resolve(result);
      });
    });
    await new Promise((resolve, reject) => {
      comment.run((error, result)=>{
        console.error(error);
        if (error) reject({ error });
        resolve(result);
      });
    });
    await new Promise((resolve, reject) => {
      comment_vote.run((error, result)=>{
        console.error(error);
        if (error) reject({ error });
        resolve(result);
      });
    });
  }

  // async deleteTablesMemoryDb() {
  //   for await (let table of this.tables) {
  //     try {
  //       let stmt = dbMemory.prepare(`DROP TABLE IF EXISTS ${table}`);
  //       await new Promise((resolve, reject) => {
  //         stmt.run((error, result)=>{
  //           console.error(error);
  //           if (error) reject({ error });
  //           resolve(result);
  //         });
  //       });
  //     } catch(error) {
  //       console.error(error);
  //     }
  //   }
  // }

  async setDataMemoryDb(dataTables) {
    function preparationItem(item) {
      let keys = [];
      let valuesPoint = [];
      let values = [];
      for(let key in item) {
        keys.push(key);
        valuesPoint.push('?');
        values.push(item[key]);
      }
      return {
        keys: keys.join(),
        valuesPoint: valuesPoint.join(),
        values
      }
    }

    async function insertItems(tableName, data) {
      for await (let item of data) {
        let { keys, valuesPoint, values } = preparationItem(item);
        let stmt = dbMemory.prepare(`INSERT INTO ${tableName} (${keys}) VALUES (${valuesPoint})`, ...values);
        await new Promise((resolve, reject) => {
          stmt.run((error, result)=>{
            console.error(error);
            if (error) reject({ error });
            resolve(result);
          });
        });
      }
    }

    for(let tableName of this.tables) {
      insertItems(tableName, dataTables[tableName]);
    }
  }
}

module.exports = InitDb;