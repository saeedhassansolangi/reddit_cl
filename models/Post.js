const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: 'No description provided.' },
  subreddit: { type: String, required: true, index: true },
  url: String,
  imageAndVideoUrl: String,
  postViews: { type: Number, default: 0 },
  postViewUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  author_name: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  totalPostComments: { type: Number, default: 0 },
  upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  voteScore: { type: Number, default: 0 },
},
  { timestamps: { createdAt: 'created_at' } }
);

module.exports = mongoose.model('Post', PostSchema);
