let express = require('express');
let router = express.Router();
let multer  = require('multer');
let upload = multer({ dest: 'uploads/' });
let User = require(__APPROOT + '/class/user');

// Добавить пользователя
router.post('/', upload.array('avatar'), async (req, res, next)=> {
  let user = new User();
  let { name } = req.body;

  if (name) {
    name = JSON.stringify(name);
    user.addUser({name, avatar: req.files[0]})
    .then((result) => {
      res.setHeader('Set-Cookie', `user=${JSON.stringify(result)};path=/;maxAge=${60*60*24*365}`);

      res.send(result);
    })
    .catch((error)=>{
      res.send(error);
    });
  } else {
    res.status(500);
  }
});

module.exports = router;

