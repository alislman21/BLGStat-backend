const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const instagramPostSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    platformAccountId: {
        type: String,
        required: true
    },
    postId: {
        type: String,
        unique: true,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    media_type: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0,
    },
    comments: {
        type: Number,
        default: 0,
    },
    views: {
        type: Number,
        default: 0,
    },
    shares: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Instagram Post', instagramPostSchema);