const express = require('express');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.get("/", reportController.report);
router.get("/fetch", reportController.fetchReport);

module.exports = router;