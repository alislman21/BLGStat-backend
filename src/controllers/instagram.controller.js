const instagramService = require("../services/instagram.service");


exports.info = async (req, res, next) => {
    try {
        const savedInfo = await instagramService.info(req.user);

        await instagramService.posts(req.user);

        res.status(200).json({
            status: "success",
            savedInfo: savedInfo
        });
    } catch (err) {
        console.log(err)
        next(err); // Forward error to global error handler
    }
};

exports.posts = async (req, res, next) => {
    try {
        await instagramService.posts(req.user);

    } catch (err) {
        console.log(err)
        next(err); // Forward error to global error handler
    }
};

exports.getInfo = async (req, res) => {
    try {
        await instagramService.getInfo(req, res);

    } catch (err) {
        console.log(err)
        next(err);
    }
}

exports.getLastPost = async (req, res) => {
    try {
        await instagramService.getLastPost(req, res);
    } catch (err) {
        console.log(err)
        next(err);
    }
}

