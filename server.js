const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const chalk = require('chalk');
const morgan = require('morgan');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const dotEnv = require('dotenv');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const User = require('./models/User');
const flash = require("connect-flash")
const { cloudinaryConfig } = require('./config/cloudinaryConfig');
const DataBase = require('./config/reddit-db');
const {flash_messages} = require('./middleware/flashMessages')

dotEnv.config({ path: path.join(__dirname, 'config') });

DataBase.connect();

const database = process.env.db || "mongodb://127.0.0.1:27017/reddit-db2"
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 5000);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(require('cookie-parser')());

app.use(
  require('express-session')({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SECRET,
    store: MongoStore.create({
      mongoUrl: database,
      ttl: 7 * 24 * 60 * 60,
    }),
  })
);

app.use(flash())
app.use(flash_messages)


app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  req.io = io;
  res.locals.currentUser = req.user;
  res.locals.moment = require('moment');

  if (res.locals['currentUser']) {
    User.findById(res.locals['currentUser']._id, (err, user) => {
      res.locals.loggedInUser = user;
      return;
    });
  }
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('*', cloudinaryConfig);

app.use('/', require('./routes/index'));
app.use('/posts', require('./routes/post'));
app.use('/user', require('./routes/user'));
app.use('/subreddits', require('./routes/subreddits'));

app.get('*', function (req, res) {
  res.render('404', { title: 'Page Not Found' });
});

const server = http.listen(app.get('port'), () =>
  console.log(
    chalk.blue.bgBlack.bold(
      `server is running on the  http://localhost:${app.get('port')}`
    )
  )
);

server.on('error', (err) => {
  console.log(err.message);
  console.log(err.name);
});
