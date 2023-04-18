let path = require('path');

global.__APPROOT= path.join(__dirname, '');
let createError = require('http-errors');
let express = require('express');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let app = express();
let cors = require('cors');
let os = require('os');
let process = require('process');
let InitDb = require('./class/init-db');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// for memory db

// let isReadyApp = false;

// let runInitDb = async () => {
//   isReadyApp = false;
//   let initDb =  new InitDb();
//   await initDb.init();
//   isReadyApp = true;
// }

// runInitDb();

// app.use(async (req, res, next)=>{
//   if(isReadyApp) {
//     next();
//   } else {
//     res.send({error: 'Server is updated'})
//   }
// });



app.use('/', express.static(path.join(__dirname, 'public/dist')));
app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, 'public/dist/index.html'));
});

app.use('/api/comments', require('./api/comments'));
app.use('/api/user', require('./api/user'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


process.on('uncaughtException', (err, origin) => {
  console.error(err)
});

module.exports = app;
