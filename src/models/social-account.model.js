const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const socialAccountSchema = new mongoose.Schema({
    platform: {
        type: String, required: true, enum: ["instagram", "x"]
    }, username: {
        type: String, required: true
    },

    linkedAt: {
        type: Date
    },

    accountID: {
        type: String, required: true,
    },

    userID: {
        type: Schema.Types.ObjectId, ref: "User",
    },

    accessToken: {
        type: String, required: true,
    },

    refreshToken: {
        type: String, required: true,
    },

    accessTokenExpiryDate: {
        type: Date,
    },

    refreshTokenExpiryDate: {
        type: Date,
    }

}, {timestamps: true});

module.exports = mongoose.model("SocialAccount", socialAccountSchema);