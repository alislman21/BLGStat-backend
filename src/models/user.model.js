const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
        firstName: {
            type: String,
            required: [true, "Please enter your first name"],
            minLength: 3,
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Please enter your last name"],
            minLength: 3,
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Please enter your username"],
            minLength: 3,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            trim: true,
        },
        twitterUsername: {
            type: String,
            trim: true,
        },
        instagramUsername: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            minLength: 8,
            trim: true,
            required: [true, "Please enter your password"],
        },
        passwordConfirm: {
            type: String,
            minLength: 8,
            trim: true,
            required: [true, "Please confirm your password"],
        },
        passwordChangeAt: Date,
    },
    {timestamps: true}
);

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) {
            return next();
        }

        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    } catch (err) {
        console.log(err);
    }
});

userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
    console.log("Comparing passwords:", candidatePassword, userPassword);
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfterTokenIssued = function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const passwordChangedTime = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
        return passwordChangedTime > JWTTimestamp;
    }
    return false;
}

module.exports = mongoose.model("User", userSchema);