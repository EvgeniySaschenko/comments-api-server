let { dbPersistent } = require(__APPROOT + '/ext/db');
let sharp = require('sharp');
let striptags = require('striptags');
let config = require(__APPROOT + '/env.config');

class User {
  constructor() {
    this.message = {
      serverError: "Server error",
      userNoAdd: "Server error, user not added",
      userExist: "A user with the same name already exists",
      avatarNoAdd: "Error, user avatar not loaded",
    }
  }
  // Получить пользователя по имени
  async getUserByName(name = '') {
    let stmt = dbPersistent.prepare("SELECT * FROM user WHERE name = ?");
    let result = await new Promise((resolve, reject) => {
      stmt.get(name, (error, result)=>{
        if (error) reject({ error: this.message.serverError });
        resolve(result);
      });
    });
    return result;
  }
  // Добавить пользователя
  async addUser({name = '', avatar}) {
    name = striptags(name);

    let checkUser = await this.getUserByName(name);
    let user;
    if (checkUser) throw { error: this.message.userExist };

    let curentDate = parseInt(Date.now() / 1000);
    let smtp = dbPersistent.prepare("INSERT INTO user (name, dateCreate) VALUES (?,?)");
    user = await new Promise((resolve, reject) => {
      smtp.run(name, curentDate, (error, result) => {
        if (error) reject({ error: this.message.userNoAdd });
        let id = smtp.lastID;
        smtp.finalize();
        resolve({id, name});
      });
    });

    if (avatar) {
      let partUrl = `users/${user.id}.jpg`;
      let src = `${__APPROOT}/${avatar.path}`;
      let dist = `${__APPROOT}/public/images/${partUrl}`;
      await this.copuFile(src, dist)
        .then(()=> {
          user.img = `${config.baseUrlImg}/${partUrl}`;
        });
    }
    return user;
  }
  // Копировать файлы
  async copuFile(src, dist) {
    let file = await new Promise((resolve, reject)=>{
      sharp(src)
      .resize(200)
      .jpeg({ mozjpeg: true })
      .toFile(dist, (error, result) => {
        if (error) return reject({error: this.message.avatarNoAdd });
        resolve(result);
       });
    });
    return file;
  }
}

module.exports = User;