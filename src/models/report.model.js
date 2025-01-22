const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    month: {
        type: Number,
        default: function () {
            return new Date().getMonth()+1; // '+1' because 0 for January, 1 for February, etc.
        },
    },
    totalLikes: {
        type: Number,
        default: 0,
    },
    totalComments: {
        type: Number,
        default: 0,
    },
    totalViews: {
        type: Number,
        default: 0,
    },
    platform: {
        type: String,
        enum: ['instagram', 'x'],
    },
    following: {
        type: Number,
    },
    followers: {
        type: Number,
    },
});

module.exports = mongoose.model('Report', reportSchema);
