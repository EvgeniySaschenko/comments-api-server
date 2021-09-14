let express = require('express');
let router = express.Router();
let multer  = require('multer');
let upload = multer({ dest: 'uploads/' });
let Comments = require(__APPROOT + '/class/comments');


// Добавить комментарий
router.get('/', async (req, res, next)=> {
  let comments = new Comments();
  let { id: userId } = JSON.parse(req.cookies.user);
  let { parentId = 0, firstId, lastId, insertTo } = req.query;

  comments.preparingCommentsList({ 
    parentId: parseInt(parentId), 
    userId, 
    firstId: parseInt(firstId), 
    lastId: parseInt(lastId), 
    insertTo
  }).then((rerust)=>{ 
    if (!rerust.error) {
      res.send(rerust);
    } else {
      res.status(500).send(rerust);
    }
  })
});

// Добавить комментарий
router.post('/', upload.array('file'), async (req, res, next)=> {
  let comments = new Comments();
  let { parentId, text } = req.body;
  let { id } = JSON.parse(req.cookies.user);

  comments.addComment({ userId: id, parentId, text, files: req.files}).then((rerust)=>{ 
    if (!rerust.error) {
      res.send(rerust);
    } else {
      res.status(500).send(rerust);
    }
  })
});

// Редактировать комментарий
router.put('/', upload.array('file'), async (req, res, next)=> {
  let comments = new Comments();
  let { commentId, uploadedFiles, text } = req.body;
  let { id } = JSON.parse(req.cookies.user);

  comments.updateComment({commentId, userId: id, text, uploadedFiles, files: req.files}).then((rerust)=>{
    if (!rerust.error) {
      res.send(rerust);
    } else {
      res.status(500).send(rerust);
    }
  })
});

// Удалить комментарий
router.delete('/', upload.array('file'), async (req, res, next)=> {
  let comments = new Comments();
  let { commentId } = req.body;
  comments.deleteComment(commentId).then((rerust)=>{ 
    if (!rerust.error) {
      res.send(rerust);
    } else {
      res.status(500).send(rerust);
    }
  })
});

// Добавить / убрать лайк
router.post('/vote/', upload.none(), async (req, res, next)=> {
  let comments = new Comments();
  let { commentId, voteValue } = req.body;
  let { id } = JSON.parse(req.cookies.user);

  comments.processVote({userId: id, commentId, voteValue})
  .then((rerust)=>{ 
    if (!rerust.error) {
      res.send(rerust);
    } else {
      res.status(500).send(rerust);
    }
  })
});

module.exports = router;

