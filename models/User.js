const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, required: true, index: true,
      validate: async (value) => {
        try {
          const user = await User.findOne({ username: value });
          if (user)
            throw new Error(
              `user with the username "${value}" is already registred `
            );
        } catch (error) {
          throw error;
        }
      },
    },

    email: {
      type: String, required: true, lowercase: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
      validate: async (value) => {
        try {
          const user = await User.findOne({ email: value });
          if (user)
            throw new Error(
              `user with the email "${value}" is already registred `
            );
        } catch (error) {
          throw error;
        }
      },
    },

    password: { type: String, required: true },
    profileImage: {
      type: String, required: false, default: '/public/images/avatar_default_02_A5A4A4.png'
    },
    bio: { type: String, default: 'No bio provided.' },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    subreddits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subreddit' }],
    saved_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    saved_comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: { createdAt: 'created_at' } }
);

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, next) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    next(err, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
