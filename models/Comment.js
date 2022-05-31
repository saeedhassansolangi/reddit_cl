const mongoose = require('mongoose');
const Populate = require('../util/autopopulate');

const commentSchema = new mongoose.Schema({
    commentBody: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: { type: String, required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: { createdAt: 'created_at' } }
);

commentSchema
  .pre('findOne', Populate('author'))
  .pre('find', Populate('author'))
  .pre('findOne', Populate('comments'))
  .pre('find', Populate('comments'));

module.exports = mongoose.model('Comment', commentSchema);
