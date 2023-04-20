let { dbPersistent } = require(__APPROOT + '/ext/db');
let fsExtra = require('fs-extra');
let striptags = require('striptags');
let sharp = require('sharp');
let config = require(__APPROOT + '/env.config');

let imgExtentions = {
  "gif": true,
  "jpeg": true,
  "jpg": true,
  "png": true,
  "webp": true,
  "svg": true
};

class Comments {
  constructor() {
    this.countFileCopy = 0;
    this.message = {
      commentNoAdd: "Server error, comment not added",
      serverError: "Error on the server",
      commentNoDelelete: "Error comment not deleted",
      commentNoUpdate: "Error comment not updated",
    }
  }
  // Добавить комментарий в БД
  async addComment({ userId = 0, parentId = 0, text = '', files = []}) {
    text = this.preparationText(text);
    let filesInfo = this.preparationFilesInfo(files);
    let comment;
    let dateCreate = parseInt(Date.now() / 1000);
    let smtp = dbPersistent.prepare("INSERT INTO comment (userId, parentId, text, files, dateCreate) VALUES (?,?,?,?,?)");


    // Добаляем запись в БД
    comment = await new Promise((resolve, reject)=>{
      let files = JSON.stringify(filesInfo);
      smtp.run(userId, parentId, text, files, dateCreate, (error, result) => {
        if (error) reject({ error: this.message.commentNoAdd });
        let id = smtp.lastID;
        smtp.finalize();
        resolve({ id });
      });
    });
      // delete files
    try {
      // Копируем файлы
      await this.copuFiles(files, comment.id);
      return this.createResponse({ id: comment.id, userId, parentId, isManageEdit: true, isManageDelete: true, text, files: filesInfo, dateCreate });
    } catch(error) {
      console.error(error);
      await this.deleteComment(comment.id);
      await this.deleteFiles(files, comment.id);
      throw { error: this.message.serverError };
    }
  }
  // Удалить комментарий
  async deleteComment(commentId) {
    let smtp = dbPersistent.prepare("DELETE FROM comment WHERE id = ?");
    let result = await new Promise((resolve, reject)=>{
      smtp.run(commentId, (error) => {
        if (error) reject({ error: this.message.commentNoDelelete });
        let id = smtp.lastID;
        smtp.finalize();
        resolve({id});
      });
    });

    // delete files
    return result;
  }
  // Редактировать комментарий
  async updateComment({ userId, commentId, text, uploadedFiles, files}) {
    text = this.preparationText(text);
    uploadedFiles = JSON.parse(uploadedFiles);
    let filesInfo = this.preparationFilesInfoUpdate(files, uploadedFiles);
    let dateUpdate = parseInt(Date.now() / 1000);
    let startNumFiles = uploadedFiles.length ? uploadedFiles.length : 0;
    await this.copuFiles(files, commentId, startNumFiles);

    let smtp = dbPersistent.prepare("UPDATE comment SET userIdEdit = ?, text = ?, files = ?, dateUpdate = ? WHERE id = ?");

    await new Promise((resolve, reject) => {
      let files = JSON.stringify(filesInfo.items);
      smtp.run(userId, text, files, dateUpdate, commentId, (error) => {
        if (error) reject({ error: this.message.commentNoUpdate });
        smtp.finalize();
        resolve();
      });
    });

    // delete files

    return this.createResponse({ 
      id: commentId, 
      text, 
      files: filesInfo.items, 
      dateUpdate, 
      isEditedComment: true 
    });
  }
  // Редактировать комментарий
  async updateCommentVote({ commentId, like, dislike }) {
    let smtp = dbPersistent.prepare("UPDATE comment SET like = ?, dislike = ? WHERE id = ?");

    let result = await new Promise((resolve, reject) => {
      smtp.run(like, dislike , commentId, (error) => {
        if (error) reject({ error: this.message.commentNoUpdate });
        smtp.finalize();
        resolve({ commentId, like, dislike });
      });
    });
    return result;
  }
  // Удалить файлы
  async deleteFiles(files, commentId) {
    for (let i = 0; i < files.length; i++) {
      let path = `${__APPROOT}/public/images/comments/${commentId}_${i}.${this.getFileExtention(files[i].originalname)}`;
      await fsExtra.remove(path);
    }
  }
  // Копировать файлы
  async copuFiles(files, commentId, startNameNum = 0) {
    for (let i = 0; i < files.length; i++) {
      let extention = this.getFileExtention(files[i].originalname);
      let src = `${__APPROOT}/${files[i].path}`;
      let dist = `${__APPROOT}/public/images/comments/${commentId}_${startNameNum}.${extention}`;
      let distPreview = `${__APPROOT}/public/images/comments/preview/${commentId}_${startNameNum}.${extention}`;
      if(extention === 'svg') {
        await fsExtra.copy(src, distPreview);
      } else if (imgExtentions[extention]) {
        await this.createPreviewImg(src, distPreview);
      }
      startNameNum++;

      await fsExtra.copy(src, dist);
    }
  }
  // Создать превью
  async createPreviewImg(src, dist) {
    let file = await new Promise((resolve, reject)=>{
      sharp(src)
      .resize(400)
      .jpeg({ mozjpeg: true })
      .toFile(dist, (error, result) => {
        if (error) return reject({error: this.message.serverError });
        resolve(result);
       });
    });
    return file;
  }

  // Расшырение файла
  getFileExtention(fileName) {
    return fileName.match(/[^.]+$/i)[0];
  }
  // Ответ клиенту
  createResponse({ 
    id, 
    userId, 
    parentId, 
    userName = '',
    text, 
    files, 
    like = 0, 
    dislike = 0, 
    voteValue = 0, 
    isManageEdit = false,
    isManageDelete = false,
    answerQuantity = 0,
    dateCreate, 
    dateUpdate, 
    isEditedComment = false 
  }) {
    let response;
    files = (typeof files == 'string' ? JSON.parse(files) : files).map((file)=>{
      return {
        src: `${config.baseUrlImg}/comments/${id}_${file.partName}`,
        preview: `${config.baseUrlImg}/comments/preview/${id}_${file.partName}`,
        name: file.name
      };
    });

    if (isEditedComment) {
      response = {
        id: +id, 
        text, 
        files, 
        dateUpdate,
      }
    } else {
      response = {
        id: +id, 
        userImg: fsExtra.pathExistsSync(`${__APPROOT}/public/images/users/${userId}.jpg`) 
        ? `${config.baseUrlImg}/users/${userId}.jpg` 
        : '',
        userId: +userId, 
        parentId: +parentId, 
        userName,
        text, 
        like, 
        dislike, 
        voteValue, 
        isManageEdit,
        isManageDelete,
        files, 
        answerQuantity,
        dateCreate,
        dateUpdate,
      }
    }
    return response;
  }
  // Подготовка списка комментириев
  async preparingCommentsList({ parentId, userId, firstId, lastId, insertTo }) {
    // Получить 1-й уровень комментириев по лимиту
    let commentsLevel1 = await this.getComments({ parentId, userId, firstId, lastId, insertTo });
    // Получить количество всех комментариев 1-го уровня
    let quantityLevel1 = await this.getCommentsQuantityByParentId(parentId);
    let items = {};
    let mapItems = {};

    let createData = async (comments, quantity) => {
      for(let comment of comments) {
        comment.userName = comment.userName || "User Name";
        comment.isManageEdit = comment.userId == userId;
        comment.isManageDelete = comment.userId == userId;

        items[comment.id] = this.createResponse(comment);
        // Предки с комментариями
        if (!mapItems[comment.parentId]) {
          mapItems[comment.parentId] = {
            items: [],
            quantity,
          };
        }

        mapItems[comment.parentId].items.push(comment.id);
        // Вложенные комментарии, тоторые могут быть предками, но нас интересует только количество вложенных в них комметрариев
        if (!mapItems[comment.id]) {
          let answerQuantity = await this.getCommentsQuantityByParentId(comment.id);
          mapItems[comment.id] = {
            items: [],
            quantity: answerQuantity.quantity,
          };
        }
      }
    }

    await createData(commentsLevel1, quantityLevel1.quantity);


    for(let comment of commentsLevel1) {
      let commentsLevel2 = await this.getComments({ parentId: comment.id, quantityRecords: 5, userId });
      let quantityLevel2 = await this.getCommentsQuantityByParentId(comment.id);
      await createData(commentsLevel2, quantityLevel2.quantity);
    }

    return {
      items, mapItems
    }
  }
  // Получить комментарии
  async getComments({ parentId = 0, userId, quantityRecords = 10, firstId, lastId, insertTo }) {
    let sqlFilter = '';
    let sqlOrderByDate = parentId == 0 ? 'DESC' : 'ASC';
    if (firstId || lastId) {
      // Главная лента
      if (parentId == 0) {
        if (insertTo == 'after') {
          sqlFilter = `AND c.id < ${lastId}`;
        } else if (insertTo == 'before') {
          sqlFilter = `AND c.id > ${firstId}`;
        }
      } else {
        // Вложенные
        sqlFilter = `AND c.id > ${lastId}`;
      }
    }

    let stmt = dbPersistent.prepare(`
      SELECT 
        c.*, 
        cv.voteValue, 
        u.name as userName
      FROM comment as c
      LEFT JOIN user as u ON c.userId = u.id
      LEFT JOIN comment_vote as cv ON c.id = cv.commentId AND ? = cv.userId
      WHERE c.parentId = ? ${sqlFilter}
      ORDER BY c.dateCreate ${sqlOrderByDate} LIMIT ?`);
      let result = await new Promise((resolve, reject) => {
        stmt.all(userId, parentId, quantityRecords, (error, result) => {
          stmt.finalize();
          if (error) reject({ error: this.message.serverError });
          resolve(result);
        });
      });

    return result;
  }
  // Получить количество записей по parentId
  async getCommentsQuantityByParentId(parentId) {
    let stmt = dbPersistent.prepare("SELECT COUNT(id) as quantity FROM comment WHERE parentId = ?");
    let result = await new Promise((resolve, reject) => {
      stmt.get(parentId, (error, result)=>{
        stmt.finalize();
        if (error) reject({ error: this.message.serverError });
        resolve(result);
      });
    });

    return result;
  }

  // Получить комментарий по ID
  async getCommentById(commentId) {
    let stmt = dbPersistent.prepare("SELECT * FROM comment WHERE id = ?");
    let result = await new Promise((resolve, reject) => {
      stmt.get(commentId, (error, result)=>{
        if (error) reject({ error: this.message.serverError });
        resolve(result);
      });
    });
    return result;
  }
  // Получить голос пользователя 
  async getVoteUser(commentId, userId) {
    let stmt = dbPersistent.prepare("SELECT * FROM comment_vote WHERE commentId = ? AND userId = ?");
    let result = await new Promise((resolve, reject) => {
      stmt.get(commentId, userId, (error, result)=>{
        if (error) reject({ error: this.message.serverError });
        resolve(result);
      });
    });
    return result;
  }
  // Обработка лайка
  async processVote({ commentId, userId, voteValue }) {
    let vote = await this.getVoteUser(commentId, userId);
    let comment = await this.getCommentById(commentId);

    let result;
    let like = comment.like;
    let dislike = comment.dislike;
    if (!vote) {
      result = await this.addVote({ commentId, userId, voteValue });
      like = voteValue == 1 ? like + 1 : like;
      dislike = voteValue == -1 ? dislike + 1 : dislike;
    } else {
      if (voteValue != vote.voteValue) {
        result = await this.updateVote({ voteId: vote.id, voteValue });
        like = voteValue == 1 ? like + 1 : like - 1;
        dislike = voteValue == -1 ? dislike + 1 : dislike - 1;
      } else {
        result = await this.deleteVote(vote.id);
        like = vote.voteValue == 1 ? like - 1 : like;
        dislike = vote.voteValue == -1 ? dislike - 1 : dislike;
      }
    }
    // Обновляем количество лайков для комментрия
    await this.updateCommentVote({ 
      commentId, 
      like: like >= 0 ? like : 0, 
      dislike: dislike >= 0 ? dislike : 0, 
    });
    return result;
  }
  // Добавить лайк
  async addVote({commentId, userId, voteValue}) {
    let curentDate = parseInt(Date.now() / 1000);
    let smtp = dbPersistent.prepare("INSERT INTO comment_vote (userId, commentId, voteValue, dateCreate) VALUES (?,?,?,?)");
    let result = await new Promise((resolve, reject) => {
      smtp.run(userId, commentId, voteValue, curentDate, (error) => {
        if (error) reject({ error: this.message.serverError });
        let voteId = smtp.lastID;
        smtp.finalize();
        resolve({ voteValue });
      });
    });
    return result;
  }
  // Удалить лайк
  async deleteVote(voteId) {
    let smtp = dbPersistent.prepare("DELETE FROM comment_vote WHERE id = ?");
    let result = await new Promise((resolve, reject)=>{
      smtp.run(voteId, (error) => {
        if (error) reject({ error: this.message.serverError });
        smtp.finalize();
        resolve({ voteValue: 0});
      });
    });
    return result;
  }
  // Редактировать лайк
  async updateVote({voteId, voteValue}) {
    let curentDate = parseInt(Date.now() / 1000);
    let smtp = dbPersistent.prepare("UPDATE comment_vote SET voteValue = ?, dateUpdate = ? WHERE id = ?");
    let result = await new Promise((resolve, reject) => {
      smtp.run(voteValue, curentDate, voteId, (error) => {
        if (error) reject({ error: this.message.serverError });
        smtp.finalize();
        resolve({ voteValue });
      });
    });
    return result;
  }
  // Подготовка текста комментрария (удалить теги / переносы)
  preparationText(text) {
    return striptags(text); 
  }
  // Подготовка информации о файлах (для добавления в БД и других нужд)
  preparationFilesInfo(files, startNameNum = 0) {
    let filesInfo = [];
    for (let i = 0; files.length > i; i++) {
      filesInfo.push({
        name: files[i].originalname,
        partName: `${startNameNum}.${this.getFileExtention(files[i].originalname)}`,
      });
      startNameNum++;
    }
    return filesInfo; 
  }
  // Подготовка информации о файлах (для добавления в БД и других нужд)
  preparationFilesInfoUpdate(files, uploadedFiles) {
    let filesInfo = [];
    let itemsDelete = [];
    for (let item of uploadedFiles) {
      if (!item.isDelete) {
        filesInfo.push({
          name: item.name,
          partName: `${item.src.match(/[^_]+$/i)[0]}`,
        });
      } else {
        itemsDelete.push(item.src.replace(config.baseUrl, ''));
      }
    }

    return {
      items: [...filesInfo, ...this.preparationFilesInfo(files, uploadedFiles.length)],
      itemsDelete 
    };
  }
  
}

module.exports = Comments;