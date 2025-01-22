const express = require("express");
const twitterController = require("../controllers/twitter.controller");
const { protect } = require("../middlewares/auth.middleware");
const instagramController = require("../controllers/instagram.controller");

const router = express.Router();

// Public routes
router.get("/auth", twitterController.auth);
router.get("/auth/callback", twitterController.authCallback);
router.get("/info", twitterController.info);
router.get("/tweets", twitterController.tweets);
router.get("/getinfo", twitterController.getInfo);


module.exports = router;