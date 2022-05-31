const Post = require('../models/Post');
const  User  = require('../models/User');
const Comment = require('../models/Comment');
const { dataUri } = require('../middleware/multer');
const { uploader } = require('../config/cloudinaryConfig');
const Subreddits = require('../models/Subreddits');

const createPost = (req, res) => {
  res.render('post-new', { title: 'Submit to Node Reddit' });
};

const receiveData = (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      return res.render('post-new', { error: err.message });
    }

    req.body.title = req.body.title.trim();
    Post.create(req.body, (err, post) => {
      if (err) {
        return res.render('post-new', { error: err.message });
      }

      post.author_name = req.user.username;
      post.author = req.user._id;
      post.save();

      if (!req.file) {
        user.posts.unshift(post);
        user.save({ validateBeforeSave: false }, (err, u) => {
          if (err) {
            console.log(err.message);
          }
        });
        return res.redirect('/');
      }

      if (req.file) {
        const file = dataUri(req).content;
        return uploader
          .upload(file)
          .then((result) => {
            post.imageAndVideoUrl = result.url;
            post.save();
            user.posts.unshift(post);
            user.save({ validateBeforeSave: false }, (err, u) => {
              if (err) {
                console.log(err.message);
              }
            });
            return res.redirect('/');
          })
          .catch((err) =>
            res.status(400).json({
              messge: 'someting went wrong while processing your request',
              data: { err },
            })
          );
      }
    });
  });
};

const searchedPost = (req, res) => {
  Subreddits.findOne({ subredditName: req.query.q }).exec((err, subreddit) => {
    if (err) {
      return res.render('show-search-result', {
        error: err.message,
        title: `${req.query.q} search results`,
        queryParams: req.query.q,
        posts: [],
        subreddit: req.query.q,
      });
    }

    if (subreddit) {
      Post.find({ subreddit: subreddit.subredditName }, (err, posts) => {
        return res.render('subreddits', {
          posts,
          subreddit: req.query.q,
          subredditDetail: subreddit,
          queryParams: req.query.q,
          title: `r/${req.query.q}: subreddit`,
        });
      });
    }

    const query = new RegExp(req.query.q, 'i');

    Subreddits.aggregate([
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          subredditType: 0,
          subredditName: 0,
          subredditDescription: 0,
          created_at: 0,
          updatedAt: 0,
          __v: 0,
          subredditOwner: 0,
          subredditProfile: 0,
        },
      },
      {
        $facet: {
          c1: [
            {
              $lookup: {
                from: 'subreddits',
                pipeline: [{ $match: { subredditName: query } }],
                as: 'subreddits',
              },
            },
          ],

          c2: [
            {
              $lookup: {
                from: 'posts',
                pipeline: [{ $match: { title: query } }],
                as: 'posts',
              },
            },
          ],

          c3: [
            {
              $lookup: {
                from: 'users',
                pipeline: [{ $match: { username: query } }],
                as: 'users',
              },
            },
          ],
        },
      },

      {
        $project: {
          data: {
            $concatArrays: ['$c1', '$c2', '$c3'],
          },
        },
      },
      { $unwind: '$data' },
      { $replaceRoot: { newRoot: '$data' } },
    ]).exec((err, result) => {
      const subreddits = result[0].subreddits;
      const posts = result[1].posts;
      const users = result[2].users;

      Post.populate(
        posts,
        {
          path: 'postViewUsers upVotes downVotes author',
        },
        (err, posts) => {
          return res.render('show-search-result', {
            posts,
            subreddits,
            users,
            queryParams: req.query.q,
            title: `${req.query.q} search results`,
          });
        }
      );
    });
  });
};

const findSinglePost = (req, res) => {
  Post.findById(req.params.postId)
    .populate('author comments upVotes downVotes')
    .exec((err, post) => {
      let error;
      if (err) {
        error = new Error(`Invalid "${req.params.postId}" id `);
        return res.render('show-post', { error, title: error });
      }

      if (!post) {
        error = new Error(
          `Post with the "${req.params.postId}" id is not present`
        );
        return res.render('show-post', { error, title: error });
      }

      Subreddits.findOne(
        { subredditName: post.subreddit },
        (err, subreddit) => {
          let comments = post.comments.map((x) => getCount(x));

          function getCount(obj, count = 0) {
            if (!obj.comments.length) return 1;
            return Math.max(...obj.comments.map((x) => getCount(x) + 1));
          }

          let totalComments = 0;
          for (const i of comments) {
            totalComments += i;
          }

          const { title: postTitle } = post;
          const { subredditName } = subreddit;

          if (!req.user) {
            return res.render('show-post', {
              post,
              subreddit,
              title: `${postTitle} : ${subredditName}`,
            });
          }

          if (req.user && post.postViewUsers.includes(req.user._id)) {
            post.totalPostComments = totalComments;
            post.save();
            return res.render('show-post', {
              post,
              subreddit,
              title: `${postTitle} : ${subredditName}`,
            });
          }

          if (req.user && !post.postViewUsers.includes(req.user._id)) {
            post.postViewUsers.push(req.user._id);
            post.postViews++;
            post.totalPostComments = totalComments;
            post.save();
            return res.render('show-post', {
              post,
              subreddit,
              title: `${postTitle} : ${subredditName}`,
            });
          }
        }
      );
    });
};

const searchPosts = (req, res) => {
  const regex = new RegExp(req.params.post, 'i');
  Subreddits.find({ subredditName: regex })
    .sort({ updated_at: -1 })
    .sort({ created_at: -1 })
    .limit(20)
    .then((subreddits) => {
      res.send(
        subreddits,
        {
          'Content-Type': 'application/json',
        },
        200
      );
    })
    .catch((err) => {
      res.send(
        JSON.stringify(err),
        {
          'Content-Type': 'application/json',
        },
        404
      );
    });
};

const addComment = (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      return res.send({ error: err.message });
    }

    if (!post) {
      return res.send({ error: err.message });
    }

    req.body.author = req.user._id;
    req.body.username = req.user.username;
    Comment.create(req.body, (err, comment) => {
      if (err) {
        return res.send({ error: err.message });
      } else {
        comment.save();
        post.comments.unshift(comment);
        post.save((err, posts) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect(`/posts/${req.params.postId}`);
          }
        });
      }
    });
  });
};

const showReplyForm = (req, res) => {
  let post;
  Post.findById(req.params.postId)
    .lean()
    .then((p) => {
      post = p;
      return Comment.findById(req.params.commentId);
    })
    .then((comment) => {
      res.render('replies-new', {
        post,
        comment,
        title: `reply to ${comment.commentBody} : ${post.title} post`,
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const addNewReply = (req, res) => {
  const reply = new Comment(req.body);
  reply.author = req.user._id;
  reply.username = req.user.username;
  Post.findById(req.params.postId).then((post) => {
    Promise.all([reply.save(), Comment.findById(req.params.commentId)])
      .then(([reply, comment]) => {
        comment.comments.unshift(reply._id);
        return Promise.all([comment.save()]);
      })
      .then(() => {
        res.redirect(`/posts/${req.params.postId}`);
      })
      .catch(console.error);
    return post.save();
  });
};

const addSavePost = (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      return res.send({ error: err.message });
    }

    User.findById(req.user._id, (err, user) => {
      if (err) {
        return res.send({ error: err.message });
      }

      if (user.saved_posts.includes(req.params.postId)) {
        return res.send('post is already saved');
      }

      user.saved_posts.push(req.params.postId);
      user.save({ validateBeforeSave: false }, (err, sub) => {
        if (err) {
          console.log(err.message);
        }
        res.send('saved');
      });
    });
  });
};

const unSavePost = (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      return res.send({ error: err.message });
    }

    User.findById(req.user._id, (err, user) => {
      if (err) {
        return res.send({ error: err.message });
      }

      const post_index = user.saved_posts.indexOf(post._id);

      if (post_index === -1) {
        return res.send("you havn't saved it yet!");
      }

      user.saved_posts.splice(post_index, 1);
      user.save({ validateBeforeSave: false }, (err, sub) => {
        if (err) {
          return res.send({ error: err.message });
        }

        res.send('Post Unsave Successfully');
      });
    });
  });
};

const deletePost = (req, res) => {
  Post.findByIdAndRemove(req.params.postId, (err, post) => {
    if (err) {
      return res.send(err.message);
    }
    res.send('success');
  });
};

const saveComment = (req, res) => {
  const { postId, commentId } = req.params;

  Post.findById(postId, (err, post) => {
    if (err) {
      return res.send(err.message);
    }
    Comment.findById(commentId, (err, comment) => {
      if (err) {
        return res.send(err.message);
      }

      User.findById(req.user._id, (err, user) => {
        user.saved_comments.push(commentId);
        user.save({ validateBeforeSave: false }, (err, sub) => {
          if (err) {
            res.send({ error: err.message });
            return;
          }
          console.log(sub);
          res.send('Comment Save Successfully');
        });
      });
    });
  });
};

const unsaveComment = (req, res) => {
  const { postId, commentId } = req.params;

  Post.findById(postId, (err, post) => {
    if (err) {
      return res.send(err.message);
    }

    Comment.findById(commentId, (err, comment) => {
      if (err) {
        return res.send(err.message);
      }

      User.findById(req.user._id, (err, user) => {
        const comment_index = user.saved_comments.indexOf(comment._id);

        if (comment_index === -1) {
          res.send("you havn't saved the comment it yet!");
          return;
        }

        user.saved_comments.splice(comment_index, 1);
        user.save({ validateBeforeSave: false }, (err, sub) => {
          if (err) {
            res.send({ error: err.message });
            return;
          }

          console.log(sub);
          res.send('Post Unsave Successfully');
        });
      });
    });
  });
};

const deleteComment = (req, res) => {
  const { postId, commentId } = req.params;

  User.findById(req.user._id, (err, user) => {
    if (err) {
      return res.send(err.message);
    }

    Post.findById(postId, (err, post) => {
      if (err) {
        return res.send(err.message);
      }

      Comment.findByIdAndRemove(req.params.commentId, (err, comment) => {
        if (err) {
          return res.send(err.message);
        }

        if (!user.saved_comments.includes(comment._id)) {
          return res.send('Comment Deleted Successfully');
        }

        const comment_index = user.saved_comments.indexOf(comment._id);

        user.saved_comments.splice(comment_index, 1);
        user.save({ validateBeforeSave: false }, (err, sub) => {
          if (err) {
            res.send({ error: err.message });
            return;
          }

          return res.send(
            'Comment deleted with the saved comment Successfully'
          );
        });
      });
    });
  });
};

const postDownVote = (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      console.log(err.message);
      res.send('something went wrong');
      return;
    }

    if (
      req.user &&
      !post.downVotes.includes(req.user._id) &&
      post.upVotes.includes(req.user._id)
    ) {
      const user_id = post.upVotes.indexOf(req.user._id);
      post.upVotes.splice(user_id, 1);
      post.voteScore = post.voteScore - 1;
      post.downVotes.push(req.user._id);
      post.voteScore = post.voteScore - 1;
      post.save();
      req.io.emit('postAction', {
        postId: req.params.postId,
        voteScore: post.voteScore,
        userId: req.user._id,
        message: 'upvoted&NowDownvoted',
      });
      res.send('user has already upvoted but now it has downvoted');
      return;
    }

    if (req.user && !post.downVotes.includes(req.user._id)) {
      post.downVotes.push(req.user._id);
      post.voteScore = post.voteScore - 1;
      post.save();
      req.io.emit('postAction', {
        postId: req.params.postId,
        voteScore: post.voteScore,
        message: 'newUser&Downvoted',
      });
      res.send('User is new and it has downvoted');
      return;
    }

    if (req.user && post.downVotes.includes(req.user._id)) {
      const user_id = post.downVotes.indexOf(req.user._id);
      post.downVotes.splice(user_id, 1);
      post.voteScore = post.voteScore + 1;
      post.save();

      req.io.emit('postAction', {
        postId: req.params.postId,
        voteScore: post.voteScore,
        message: 'newUser&removedDownvoted',
      });
      res.send('user is new and removing downvoted');
      return;
    }
  });
};

const postUpVote = (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      console.log(err.message);
      res.send('something went wrong' + err.message);
      return;
    }

    if (
      req.user &&
      !post.upVotes.includes(req.user._id) &&
      post.downVotes.includes(req.user._id)
    ) {
      const user_id = post.downVotes.indexOf(req.user._id);
      post.downVotes.splice(user_id, 1);
      post.voteScore = post.voteScore + 1;
      post.upVotes.push(req.user._id);
      post.voteScore = post.voteScore + 1;
      post.save();
      req.io.emit('postAction', {
        postId: req.params.postId,
        voteScore: post.voteScore,
        message: 'downvoted&NowUpvoted',
      });
      res.send('User has already downvoted and now it has upvoted');
      return;
    }

    if (req.user && !post.upVotes.includes(req.user._id)) {
      post.upVotes.push(req.user._id);
      post.voteScore = post.voteScore + 1;
      post.save();
      req.io.emit('postAction', {
        postId: req.params.postId,
        voteScore: post.voteScore,
        message: 'newUser&Upvoted',
      });
      res.send('User is new and it has upvoted');
      return;
    }

    if (req.user && post.upVotes.includes(req.user._id)) {
      const user_id = post.upVotes.indexOf(req.user._id);
      post.upVotes.splice(user_id, 1);
      post.voteScore = post.voteScore - 1;
      post.save();
      req.io.emit('postAction', {
        postId: req.params.postId,
        voteScore: post.voteScore,
        message: 'newUser&removedUpvoted',
      });
      res.send('User is new and removing upvoted');
      return;
    }
  });
};

module.exports.Post = {
  createPost,
  receiveData,
  findSinglePost,
  searchPosts,
  searchedPost,
  addComment,
  showReplyForm,
  addNewReply,
  addSavePost,
  unSavePost,
  deletePost,
  saveComment,
  unsaveComment,
  deleteComment,
  postDownVote,
  postUpVote
};
