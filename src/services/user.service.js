const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (userData) => {
    const { firstName, lastName, username, email, password, passwordConfirm } = userData;

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email is already in use.");
    }
    
    // Create a new user
    const newUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
        passwordConfirm,
    });

    return newUser;
};

exports.login = async (email, password) => {
    // Check if the user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new Error("Incorrect email or password.");
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Incorrect email or password.");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    console.log('login successfully!')
    return token;
};

exports.getUserById = async (userId) => {
    console.log(userId);
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    return user;
};

exports.updateUser = async (userId, updateData) => {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });
    if (!updatedUser) {
        throw new Error("User not found.");
    }
    return updatedUser;
};

exports.deleteUser = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
        throw new Error("User not found.");
    }
    return;
};

exports.profileInsta = async (user, instagramUsername) => {
    const updatedUser = await User.findByIdAndUpdate(user.id, {
        instagramUsername: instagramUsername,
    }, {
        new: true,
        runValidators: true,
    });
    console.log('update insta username');
    if (!updatedUser) {
        throw new Error("User not found.");
    }
    return updatedUser;
}

exports.profileTwitter = async (user, twitterUsername) => {
    const updatedUser = await User.findByIdAndUpdate(user.id, {
        twitterUsername: twitterUsername,
    }, {
        new: true,
        runValidators: true,
    });
    console.log('update twitter username');
    if (!updatedUser) {
        throw new Error("User not found.");
    }
    return updatedUser;
}

exports.changePassword = async (req) => {
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    if (!password || !newPassword) {
        throw new Error('Some field is empty');
    }

    try {
        // Fetch the current user by ID
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            throw new Error('User not found');
        }

        // Compare the provided password with the user's current password
        const isPasswordCorrect = await currentUser.checkPassword(password, currentUser.password);

        if (!isPasswordCorrect) {
            throw new Error('Incorrect password');
        }

        // Update the user's password
        currentUser.password = newPassword; // Assign the new password
        await currentUser.save(); // Save the updated user document
    } catch (err) {
        console.error(err);
        throw new Error('Failed to change password');
    }
};