const Subreddits = require('../models/Subreddits');
const User = require('../models/User');
const { randomColor } = require('../util/colors');

const getAllSubreddits = (req, res) => {
  Subreddits.find({})
    .sort({ updated_at: -1 })
    .sort({ created_at: -1 })
    .limit(10)
    .exec((err, subreddits) => {
      res.send(subreddits);
    });
};

const createNewSubreddit = (req, res) => {
  res.render('subreddit-new', { title: 'Create Community' });
};

const addSubreddit = (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      console.log(err.message);
      return;
    }

    if (!user) {
      return res.render('subreddit-new', { error: 'User not found' });
    }

    req.body.subredditName = req.body.subredditName.trim();

    Subreddits.create(req.body, (err, subreddit) => {
      if (err) {
        return res.render('subreddit-new', { error: err.message });
      }

      subreddit.subredditProfile = `https://ui-avatars.com/api/name=${subreddit.subredditName
        }?background=${randomColor()}`;

      subreddit.subredditOwner = req.user.username;
      subreddit.save({ validateBeforeSave: false }, (err, sub) => {
        if (err) {
          console.log(err.message);
          return;
        }

        user.subreddits.push(sub);
        user.save({ validateBeforeSave: false }, (err, s) => {
          if (err) {
            return res.send('Something went wrong');
          }
        });
      });

      res.redirect('/');
    });
  });
};

const subreddits = (req, res) => {
  Subreddits.find({}, (err, subreddits) => {
    res.render('show-subreddits', { subreddits, title: "subreddits" });
  });
};

module.exports = {
  subreddits,
  createNewSubreddit,
  addSubreddit,
  getAllSubreddits,
};
