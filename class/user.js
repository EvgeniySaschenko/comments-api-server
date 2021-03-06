let db = require(__APPROOT + '/ext/db');
let sharp = require('sharp');
let striptags = require('striptags');
let config = require(__APPROOT + '/env.config');

class User {
  constructor() {
    this.message = {
      serverError: "Ошибка сервера",
      userNoAdd: "Ошибка сервера, пользльзователь не добавлен",
      userExist: "Пользователь с таким именем уже существует",
      avatarNoAdd: "Ошибка, аватар пользователя не загружен",
    }
  }
  // Получить пользователя по имени
  async getUserByName(name = '') {
    let stmt = db.prepare("SELECT * FROM user WHERE name = ?");
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
    try {
      name = striptags(name);
      let checkUser = await this.getUserByName(name);
      let user;
      if (checkUser) return { error: this.message.userExist };

      let curentDate = parseInt(Date.now() / 1000);
      let smtp = db.prepare("INSERT INTO user (name, dateCreate) VALUES (?,?)");
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
          }).catch((error)=>{
            user.error = error.error;
          });
      }
      return user;
    } catch(error) {
      console.log(error);
      return error;
    }
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