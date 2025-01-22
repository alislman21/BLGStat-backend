const express = require("express");
const userRoutes = require("./user.routes");
const twitterRoutes = require("./twitter.routes");
const instagramRoutes = require("./instagram.routes");
const dashboardRoutes = require("./dashboard.routes");
const reportRoutes = require("./report.routes");

const router = express.Router();

// Use the user routes
router.use("/", userRoutes);
router.use("/twitter", twitterRoutes);
router.use("/instagram", instagramRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/report", reportRoutes);

module.exports = router;
