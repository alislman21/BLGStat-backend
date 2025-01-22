const twitterService = require("../services/twitter.service");
const SocialAccountModel = require("../models/social-account.model");
const {promisify} = require("util");
const User = require("../models/user.model");
const instagramService = require("../services/instagram.service");


exports.auth = async (req, res, next) => {
    try {
        const {url, codeVerifier, state} = await twitterService.auth(req.body);
        // // Store codeVerifier and state in the session
        // req.session.codeVerifier = codeVerifier;
        // req.session.state = state;

        // Set token in a cookie
        const cookieOptions = {
            httpOnly: true, // Prevent client-side scripts from accessing the cookie
            secure: process.env.NODE_ENV === "production", // Use HTTPS in production
            maxAge: 24 * 60 * 60 * 1000, // Convert days to milliseconds
        };

        res.cookie("codeVerifier", codeVerifier, cookieOptions);
        res.cookie("state", state, cookieOptions);

        // Redirect user to Twitter for authentication
        res.redirect(url);
    } catch (err) {
        next(err); // Forward error to global error handler
    }
};

exports.authCallback = async (req, res, next) => {
    try {
        const {state, code} = req.query;

        // Verify state matches
        if (!state || state !== req.cookies.state) {
            return res.status(400).send('State mismatch error');
        }

        const {user, accessToken, refreshToken} = await twitterService.authCallback(state, code, req.cookies.codeVerifier);

        const {jwt} = req.cookies

        const decoded = await promisify(jwt.verify)(jwt, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return res.status(401).json({
                status: "fail",
                message: "The user belonging to this token no longer exists.",
            });
        }

        await SocialAccountModel.create({
            platform: 'x',
            linkedAt: new Date(),
            accountID: user.data.id,
            username: user.data.username,
            userID: decoded.id,
            accessToken: accessToken,
            refreshToken: refreshToken ?? '-',
        });

    } catch (err) {
        console.log(err)
        next(err); // Forward error to global error handler
    }
};

exports.info = async (req, res, next) => {
    try {
        const savedInfo = await twitterService.info(req.user);
        await twitterService.tweets(req.user);
        

        res.status(200).json({
            status: "success",
            savedInfo: savedInfo
        });
    } catch (err) {
        console.log(err)
        next(err); // Forward error to global error handler
    }
};

exports.tweets = async (req, res, next) => {
    try {
        await twitterService.tweets(req.user);

    } catch (err) {
        console.log(err)
        next(err); // Forward error to global error handler
    }
};

exports.getInfo = async (req, res) => {
    try {
        await twitterService.getInfo(req, res);

    } catch (err){
        console.log(err)
        next(err);
    }
}