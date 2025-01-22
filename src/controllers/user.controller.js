const userService = require("../services/user.service");

exports.signup = async (req, res, next) => {
    try {
        const user = await userService.signup(req.body);
        res.status(201).json({
            status: "success",
            data: {user},
        });
    } catch (err) {
        next(err); // Forward error to global error handler
    }
};

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const token = await userService.login(email, password);
        // Set token in a cookie
        // const cookieOptions = {
        //     httpOnly: true, // Prevent client-side scripts from accessing the cookie
        //     secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        //     maxAge: 24 * 60 * 60 * 1000, // Convert days to milliseconds
        // };
        //
        // res.cookie("jwt", token, cookieOptions);
        res.status(200).json({
            status: "success",
            token,
        });
    } catch (err) {
        next(err);
    }
};

exports.test = async (req, res, next) => {
    try {
        res.status(200).json({
            status: "success"
        });
    } catch (err) {
        next(err);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        console.log('controller');
        const user = await userService.getUserById(req.user.id);
        res.status(200).json({
            status: "success",
            data: {user},
        });
    } catch (err) {
        next(err);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateUser(req.user.id, req.body);
        res.status(200).json({
            status: "success",
            data: {user: updatedUser},
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.user.id);
        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (err) {
        next(err);
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.cookie("jwt", "", {
            httpOnly: true,
            expires: new Date(0), // Expire immediately
        });
        res.status(200).json({status: "success", message: "Logged out successfully"});
    } catch (err) {
        next(err);
    }
};

exports.profileInsta = async (req, res, next) => {
    try {
        const updatedUser = await userService.profileInsta(req.user, req.body.instagramUsername)

        res.status(200).json({
            status: "success",
            data: {user: updatedUser},
        });
    } catch (err) {
        next(err);
    }
};

exports.profileTwitter = async (req, res, next) => {
    try {
        const updatedUser = await userService.profileTwitter(req.user, req.body.twitterUsername);

        res.status(200).json({
            status: "success",
            data: {user: updatedUser},
        });
    } catch (err) {
        next(err);
    }
};


exports.changePassword = async (req, res, next) => {
    try {
        const changePass = await userService.changePassword(req);

    } catch(err) {
        console.log(err);
        next(err)
    }
}