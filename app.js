let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

require('dotenv').config();

let app = express();

app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 100 // обмеження кожного IP до 100 запитів за вікно часу
});

// Підключення до бази даних
db_url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PASS}`
mongoose.connect(db_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Помилка з\'єднання:'));
db.once('open', function() {
  console.log('Успішно підключено до MongoDB');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));

//middleware
app.use(helmet());
app.use(limiter);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (err.code === 'ERR_RATE_LIMIT') {
    err.status = 429;
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});

module.exports = app;
