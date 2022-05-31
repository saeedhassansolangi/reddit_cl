const express = require('express');
const router = express.Router();
const { Post } = require('../controllers/index');
const passportConfig = require('../services/passport');


router.get('/', Post.getAllPosts);
router.get('/r/:subreddit', Post.findSubreddit);
router.get('/r/:subreddit/submit', passportConfig.isAuthenticated, Post.submitPostOnSubreddit);
router.get('/u/:username', Post.postAuthor);
router.get('/u/:username/saved_posts', Post.showUsersSavedPosts);
router.get('/u/:username/saved_comments', Post.showUsersSavedComments);
router.get('/u/:username/subreddits', Post.showUsersSubreddits);

module.exports = router;
