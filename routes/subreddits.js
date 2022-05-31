const express = require('express');
const router = express.Router();
const Subreddit = require('../controllers/Subreddit');
const passportConfig = require('../services/passport');

router.get('/', Subreddit.subreddits);
router.get('/all', Subreddit.getAllSubreddits);
router.get(
  '/create',
  passportConfig.isAuthenticated,
  Subreddit.createNewSubreddit
);
router.post('/create', Subreddit.addSubreddit);

module.exports = router;
