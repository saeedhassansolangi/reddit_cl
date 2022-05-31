const express = require('express');

const router = express.Router();

const { Post } = require('../controllers/Post');
const { multerUploads } = require('../middleware/multer');
const passportConfig = require('../services/passport');

router.get('/new', passportConfig.isAuthenticated, Post.createPost);
router.post('/new', multerUploads, Post.receiveData);
router.get('/search/', Post.searchedPost);
router.get('/:postId', Post.findSinglePost);
router.get('/searchPosts/:post', Post.searchPosts);
router.post('/:postId/comments', Post.addComment);
router.get('/:postId/comments/:commentId/replies/new', Post.showReplyForm);
router.post('/:postId/comments/:commentId/replies', Post.addNewReply);
router.post('/:postId/save', passportConfig.isAuthenticated, Post.addSavePost);
router.delete('/:postId/unsave', passportConfig.isAuthenticated, Post.unSavePost);
router.delete('/:postId/delete', passportConfig.isAuthenticated, Post.deletePost);
router.post('/:postId/comment/:commentId/save', passportConfig.isAuthenticated, Post.saveComment);
router.delete('/:postId/comment/:commentId/unsave', passportConfig.isAuthenticated, Post.unsaveComment);
router.delete('/:postId/comment/:commentId/delete', passportConfig.isAuthenticated, Post.deleteComment);
router.post('/:postId/downvote', passportConfig.isAuthenticated, Post.postDownVote);
router.post('/:postId/upvote', passportConfig.isAuthenticated, Post.postUpVote);

module.exports = router;
