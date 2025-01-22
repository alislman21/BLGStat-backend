const express = require("express");
const userController = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.post("/test", userController.test);

// // Protected routes
router.use(protect); // Middleware to protect the routes below
router.post("/profileinsta", userController.profileInsta); 
router.post("/profiletwitter", userController.profileTwitter); 

router.get("/profile", userController.getProfile);
router.patch("/update", userController.updateUser);
router.post('/changepassword', userController.changePassword);
// router.delete("/delete", userController.deleteUser);

module.exports = router;