let express = require('express');
let router = express.Router();
let multer  = require('multer');
let upload = multer({ dest: 'uploads/' });
let Comments = require(__APPROOT + '/class/comments');
let User = require(__APPROOT + '/class/user');

// Для хероку - пототому что он удалят данные
router.use(async (req, res, next)=>{
  let user = new User();
  let { createUser } = req.query;
  let name;
  if (req.cookies.user) {
    let userData = JSON.parse(req.cookies.user || '{}');
    name = userData.name;
  }

  if (name || createUser == 1) {

    if (!name && createUser == 1) {
      name = 'user' + parseInt(Date.now() / 1000);
    }
    let result = await user.getUserByName(name);

    if (result) {
      next();
    } else {
      try {
        let result = await user.addUser({name, avatar: false});
        res.setHeader('Set-Cookie', `user=${JSON.stringify(result)};path=/;maxAge=${60*60*24*365}`);
        if (req.cookies.user) {
          req.cookies.user.id = result.id;
        }

        next();
      } catch (error) {
        console.error(error);
        res.send(error);
      }
    }
  } else {
    next();
  }
});

// Получить список комментариев
router.get('/', async (req, res, next)=> {
  let comments = new Comments();
  let { id: userId } = JSON.parse(req.cookies.user || '{}');
  let { parentId = 0, firstId, lastId, insertTo } = req.query;

  comments.preparingCommentsList({ 
    parentId: parseInt(parentId), 
    userId, 
    firstId: parseInt(firstId), 
    lastId: parseInt(lastId), 
    insertTo
  }).then((rerust)=>{ 
    res.send(rerust);
  }).catch((error)=>{
    console.error(error);
    res.send(error);
  });
});

// Добавить комментарий
router.post('/', upload.array('file'), async (req, res, next)=> {
  let comments = new Comments();
  let { parentId, text } = req.body;
  let { id } = JSON.parse(req.cookies.user);

  comments.addComment({ userId: id, parentId, text, files: req.files})
    .then((rerust)=>{ 
      res.send(rerust);
    }).catch((error)=>{
      console.error(error);
      res.send(error);
    });
});

// Редактировать комментарий
router.put('/', upload.array('file'), async (req, res, next)=> {
  let comments = new Comments();
  let { commentId, uploadedFiles, text } = req.body;
  let { id } = JSON.parse(req.cookies.user || '{}');

  comments.updateComment({commentId, userId: id, text, uploadedFiles, files: req.files})
  .then((rerust)=>{ 
    res.send(rerust);
  }).catch((error)=>{
    console.error(error);
    res.send(error);
  });
});

// Удалить комментарий
router.delete('/', upload.array('file'), async (req, res, next)=> {
  let comments = new Comments();
  let { commentId } = req.body;
  comments.deleteComment(commentId)
  .then((rerust)=>{ 
    res.send(rerust);
  }).catch((error)=>{
    console.error(error);
    res.send(error);
  });
});

// Добавить / убрать лайк
router.post('/vote/', upload.none(), async (req, res, next)=> {
  let comments = new Comments();
  let { commentId, voteValue } = req.body;
  let { id } = JSON.parse(req.cookies.user || '{}');

  comments.processVote({userId: id, commentId, voteValue})
  .then((rerust)=>{ 
    res.send(rerust);
  }).catch((error)=>{
    console.error(error);
    res.send(error);
  });
});

module.exports = router;

