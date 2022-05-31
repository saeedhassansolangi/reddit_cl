const passport = require('passport');
const passportLocal = require('passport-local');

const User = require('../models/User');

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase().trim() }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(undefined, false, {
          error: `Email ${email} not found.`,
        });
      }

      user.comparePassword(password, (error, isMatch) => {
        if (error) {
          return done(error);
        }
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, {
          error: 'Invalid email or password.',
        });
      });
    });
  })
);

module.exports = {
  isAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error',"you first need to login in order to do this")
    res.redirect('/user/login');
  },
};
