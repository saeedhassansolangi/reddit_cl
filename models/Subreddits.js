const mongoose = require('mongoose');

const subredditSchema = new mongoose.Schema(
  {
    subredditName: {
      type: String,
      required: true,
      index: true,
      validate: async (subreddit) => {
        try {
          const sub = await Subreddits.find({ subredditName: subreddit });
          if (sub.length !== 0) {
            throw new Error(
              `This "${subreddit}" subreddit is already created `
            );
          }
        } catch (error) {
          throw error;
        }
      },
    },

    subredditDescription: {
      type: String,
      required: false,
    },

    subredditType: {
      type: String,
      enum: ['private', 'public'],
      default: 'public',
    },

    subredditProfile: {
      type: String,
      required: false,
      default: 'https://ui-avatars.com/api/name=Default%20Image',
    },
    subredditOwner: { type: String, required: false },
  },
  { timestamps: { createdAt: 'created_at' } }
);

const Subreddits = mongoose.model('Subreddit', subredditSchema);

module.exports = Subreddits;
