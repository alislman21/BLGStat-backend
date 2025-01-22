const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const twitterTweetSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    platformAccountId: {
        type: String,
        required: true 
    },
    tweetId: {
        type: String,
        unique: true,
        required: true 
    },
    text: {
        type: String,
        required: true 
    },
    retweets: {
        type: Number,
        default: 0 
    },
    replies: {
        type: Number,
        default: 0 
    },
    likes: {
        type: Number,
        default: 0
    },
    quotes: {
        type: Number,
        default: 0 
    },
    bookmarks: {
        type: Number,
        default: 0
    },
    impressions: {
        type: Number,
        default: 0 
    },
    createdAt: {
        type: Date,
        required: true 
    }
});

module.exports = mongoose.model('TwitterTweet', twitterTweetSchema);
