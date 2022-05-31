const User = require('../models/User');

const showSignUpForm = (req, res) => {
  res.render('register',{title:"Register"});
};

const showLoginForm = (req, res) => {
  res.render('login',{title:"Login"});
};

const addUser = async (req, res) => {
  const { password, confirm_password } = req.body;
  const payloads = { title: 'Register' };

  if (password === '') {
    payloads.error = 'Password field cant be empty';
    return res.render('register', { ...payloads });
  }

  if (password !== confirm_password) {
    payloads.error = 'password field is not matched with the confirm password field';
    return res.render('register', { ...payloads });
  }

  if (password.length < 5) {
    payloads.error = 'Password length must be 5 characters long';
    return res.render('register', { ...payloads });
  }

  User.create(req.body, (err, user) => {
    if (err) {
      return res.render('register', { error: err.message });
    }
    req.flash("success","You need to login in order")
    res.redirect('/user/login');
  });
};

const userLogout = (req, res) => {
  req.logout();
  res.redirect('/');
};

const userProfile = (req, res) => {
  User.findOne({ username: req.params.username })
    .populate({
      path: 'posts',
      populate: { path: 'postViewUsers author upVotes downVotes' },
    })
    .populate('subreddits saved_posts')
    .exec((err, user) => {
      if (err) {
        return res.send('something went wrong' + err.message);
      } else {
        res.render('post-author', {
          user,
          routePath: '',
          title: `${user.username} (u/${user.username})`,
        });
      }
    });
};

const updateLoggedInUserProfile = (req, res) => {
  const username = req.params.username
  User.findOne({ username}, (err, user) => {
    if (err) {
      return res.send({ error: err.message });
    }
    res.render('udpate-profile', { user, title: `u/${username} | Update Bio` });
  });
};

const updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.params.userId, req.body, { new: true },
    (err, updatedUser) => {
      if (err) {
        return res.send(err.message);
      }
      res.redirect(`/user/${req.params.username}`);
    }
  );
};

const allowUserNewPost = (req, res) => {
  res.render('post-new', {
    submittedIn: req.params.username,
    title: req.params.username,
  });
};

const changeAvatar = (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      return res.send({ error: err.message });
    }
    res.render('show-avatar', { user, title: 'Change Avatar' });
  });
};

const updateAvatar = (req, res) => {
  User.findOne({ username: req.params.username }, (err, user) => {
    user.profileImage = req.body.avatar;
    user.save({ validateBeforeSave: false }, (err, u) => {
      if (err) {
        return res.redirect('/');
      }

      res.send({ success: true });
    });
  });
};


module.exports.User = {
  showSignUpForm,
  showLoginForm,
  addUser,
  userLogout,
  userProfile,
  updateLoggedInUserProfile,
  updateProfile,
  allowUserNewPost,
  changeAvatar,
  updateAvatar,
};
