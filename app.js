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

app.use(cors());

// test
// view engine setup
// app.set('views', path.join(__dirname, 'views/dist'));
// app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


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
  console.log(err)
});

module.exports = app;
