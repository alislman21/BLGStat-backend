const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/user.model");

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header or cookies
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "You are not logged in! Please log in to access this resource.",
            });
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: "fail",
                message: "The user belonging to this token no longer exists.",
            });
        }

        if (currentUser.passwordChangedAfterTokenIssued(decoded.iat)) {
            return res.status(401).json({
                status: "fail",
                message: "Password has been changed recently. Please log in again.",
            });
        }

        req.user = currentUser;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "Something went wrong. Please try again later.",
        });
    }
};
