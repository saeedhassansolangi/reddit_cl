const Post = require('../models/Post');
const User  = require('../models/User');
const Subreddits = require('../models/Subreddits');

const getAllPosts = (req, res) => {
  const options = {};
  const { sort:sortBy } = req.query;
  
  if (sortBy === 'new') {
    options.created_at = -1;
    options.updated_at = -1;
  }

  if (sortBy === 'views') {
    options.postViews = -1;
  }

  if (sortBy === 'comments_count') {
    options.totalPostComments = -1;
  }

  if (sortBy === 'top') {
    options.voteScore = -1;
  }

  if (sortBy === 'old') {
    options.created_at = 1;
  }

  if (Object.keys(req.query).length === 0) {
    options.voteScore = 1;
  }

  if (
    !["new", "views", "comments_count", "old"].includes(sortBy)
  ) {
    options.voteScore = -1;
  }

  Post.aggregate([
    {
      $lookup: {
        from: 'subreddits',
        localField: 'subreddit',
        foreignField: 'subredditName',
        as: 'community',
      },
    },
    { $sort: options },
  ]).exec((err, user) => {
    if (err) {
        return res.render('index', {
        posts: [],
        error: err.message,
        title: 'Node Reddit',
      });
    }

    Post.populate(
      user,
      { path: 'postViewUsers author upVotes downVotes' },
      (err, posts) => {
        if (err) {
          return res.send(err.message);
        }

        res.render('index', { posts, title: 'Node Reddit', sort:sortBy || "" });
      }
    );
  });
};

const findSubreddit = (req, res) => {
  Post.find({ subreddit: req.params.subreddit })
    .populate('author postViewUsers upVotes downVotes')
    .exec((err, posts) => {
      if (err) {
        return res.render('subreddits', { error: err.message, title: '' });
      }

      Subreddits.findOne(
        { subredditName: req.params.subreddit },
        (err, sub) => {
          if (err) {
            return;
          }
          res.render('subreddits', {
            posts,
            subreddit: req.params.subreddit,
            subredditDetail: sub,
            title: `r/${req.params.subreddit}`,
          });
        }
      );
    });
};

const postAuthor = (req, res) => {
  User.findOne({ username: req.params.username })
    .populate({
      path: 'posts',
      populate: { path: 'postViewUsers author upVotes downVotes' },
    })
    .populate('saved_posts')
    .exec((err, user) => {
      if (err) {
        return res.send('something went wrong');
      }

      res.render('post-author', {
        user,
        routePath: '',
        title: `u/${req.params.username}`,
      });
    });
};

const showUsersSavedPosts = (req, res) => {
  User.findOne({ username: req.params.username }, { subreddits: 0 })
    .populate({
      path: 'saved_posts',
      populate: { path: 'postViewUsers author upVotes downVotes' },
    })
    .exec((err, user) => {
      if (err) {
        return res.send(err.message);
      }

      const routePath = req.path.split('/')[3];
      user.posts = user.saved_posts;
      res.render('post-author', { user, routePath, title: `saved posts` });
    });
};

const showUsersSavedComments = (req, res) => {
  User.findOne(
    { username: req.params.username },
    {
      posts: 0,
      subreddits: 0,
      saved_posts: 0,
      email: 0,
      password: 0,
      __v: 0,
    }
  )
    .populate('saved_comments')
    .exec((err, user) => {
      if (err) {
        return res.send(err.message);
      }

      const routePath = req.path.split('/')[3];
      user.posts = [];
      res.render('post-author', { user, routePath, title: `saved comments` });
    });
};

const showUsersSubreddits = (req, res) => {
  User.findOne({ username: req.params.username }, { posts: 0, saved_posts: 0 })
    .populate('subreddits')
    .exec((err, user) => {
      if (err) {
          return res.send(err.message);
      }

      const routePath = req.path.split('/')[3];
      user.posts = [];
      res.render('post-author', {
        user,
        routePath,
        title: `subreddits: /u/${req.params.username}`,
      });
    });
};

const submitPostOnSubreddit = (req, res) => {
  const { subreddit: subredditName } = req.params;
  Subreddits.findOne({ subredditName: subredditName }, (err, subreddit) => {
    if (err) {
        return res.render('postOnSub', { error: err.message });
    }
    res.render('postOnSub', {
      subredditName,
      subreddit,
      title: `Submit Post on r/${subredditName}`,
    });
  });
};

module.exports.Post = {
  getAllPosts,
  findSubreddit,
  postAuthor,
  showUsersSavedPosts,
  showUsersSubreddits,
  submitPostOnSubreddit,
  showUsersSavedComments,
};
