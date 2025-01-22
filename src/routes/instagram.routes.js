const express = require("express");
const instagramController = require("../controllers/instagram.controller");
const {protect }= require("../middlewares/auth.middleware")

const router = express.Router();

// Public routes
router.use(protect); 
router.get("/info", instagramController.info);
router.get("/posts", instagramController.posts);
router.get("/getinfo", instagramController.getInfo);
router.get("/lastpost", instagramController.getLastPost);

module.exports = router;