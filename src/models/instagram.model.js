const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const instagramInfoSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    accountId: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    followers: {
        type: Number,
        default: 0,
    },
    followings: {
        type: Number,
        default: 0,
    },
    posts_count: {
        type: Number,
        default: 0,
    },
    profile_picture: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('InstagramInfo', instagramInfoSchema);